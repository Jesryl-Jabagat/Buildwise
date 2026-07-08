/* ============================================================
   live-budget.js — Real-time budget meter for configure page
   Depends on: estimator/aggregator.js
   ============================================================ */

import { generateEstimate } from "../estimator/aggregator.js";
import { currency } from "../house-data.js";

// ── Toast notification (non-blocking) ──────────────────────────────────────

let toastTimeout = null;
let toastShown = false;

function showBudgetToast(message, type = "warning") {
  let toast = document.getElementById("bw-budget-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "bw-budget-toast";
    document.body.appendChild(toast);
  }

  toast.className = `bw-budget-toast bw-budget-toast--${type}`;
  toast.innerHTML = `<span class="bw-toast-icon">${type === "danger" ? "🚫" : "⚠️"}</span> ${message}`;
  toast.classList.add("bw-budget-toast--visible");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("bw-budget-toast--visible");
    toastShown = false;
  }, 4500);
}

// ── Build meter HTML ───────────────────────────────────────────────────────

function createMeterPanel() {
  const panel = document.createElement("div");
  panel.id = "bw-live-budget-panel";
  panel.className = "bw-live-budget-panel";
  panel.innerHTML = `
    <div class="bw-lbp-header">
      <span class="bw-lbp-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px;margin-right:5px;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        Live Budget
      </span>
      <span class="bw-lbp-values">
        <span id="bw-lbp-used">PHP 0</span>
        <span class="bw-lbp-sep">/</span>
        <span id="bw-lbp-total">PHP 0</span>
      </span>
    </div>
    <div class="bw-lbp-bar-track">
      <div id="bw-lbp-bar" class="bw-lbp-bar"></div>
    </div>
    <div class="bw-lbp-footer">
      <span id="bw-lbp-status">Calculating…</span>
      <span id="bw-lbp-pct" class="bw-lbp-pct">0%</span>
    </div>
  `;
  return panel;
}

// ── Core update function ───────────────────────────────────────────────────

function updateMeter(form, typeKey, budget, submitBtn) {
  // Read current form values
  const formData = new FormData(form);
  const rawData = {};
  for (const [k, v] of formData.entries()) rawData[k] = v;

  // Patch budget from setup (the form's budget input is PHP-formatted)
  rawData.typeKey  = typeKey;
  rawData.budget   = budget;
  // Clean the form's budget field if present (it's formatted with commas)
  const budgetField = form.querySelector('[name="budgetInput"]');
  if (budgetField) {
    rawData.budget = Number(budgetField.value.replace(/[^0-9]/g, "")) || budget;
  }

  // ── Normalize toggle fields from "Yes"/"No" strings to booleans ────────────
  // FormData always returns strings. The estimator configs check these with
  // plain `if (data.applyTilesGround)` — "No" is truthy, so without this fix
  // tiles/ceiling/plaster/paint were always counted as enabled.
  const TOGGLE_FIELDS = [
    "applyTilesGround", "applyTilesSecond",
    "groundFloorCeiling", "mezzanineCeiling",
    "ceilingGroundFloor", "ceilingSecondFloor",
    "hasCeiling",
    "includePlastering", "includePainting",
    "paintGroundFloor", "paintSecondFloor",
    "plasterGroundFloor", "plasterSecondFloor",
    "includeTools",
  ];
  for (const field of TOGGLE_FIELDS) {
    if (field in rawData) {
      rawData[field] = rawData[field] === "Yes";
    }
  }

  // ── Parse numeric strings to actual numbers ─────────────────────────────
  // FormData returns strings. Configs use + operator on length/width which
  // causes string concatenation ("10" + "8" = "108") instead of addition.
  for (const field of Object.keys(rawData)) {
    const val = rawData[field];
    if (typeof val === 'string' && val !== '' && !isNaN(val)) {
      rawData[field] = parseFloat(val);
    }
  }

  // ── Normalize percentage strings → numeric (e.g. "5%" → 5, "10%" → 10) ────
  // calcTiling/calcCeiling expect the raw percentage number, not a fraction.
  const PCT_FIELDS = ["tileBreakage", "ceilingWastage"];
  for (const field of PCT_FIELDS) {
    if (rawData[field] && String(rawData[field]).endsWith("%")) {
      rawData[field] = parseFloat(rawData[field]);
    }
  }

  // ── Normalize tileSize: strip density suffix (e.g. "30x30 - 11/sqm" → "30x30") ─
  if (rawData.tileSize && rawData.tileSize.includes(" - ")) {
    rawData.tileSize = rawData.tileSize.split(" ")[0];
  }

  // ── Normalize roof type string → index number ────────────────────────────
  if (rawData.roofType && isNaN(rawData.roofType)) {
    const ROOF_TYPES = [
      "", "Corrugated GI Sheet / Yero", "Long Span Pre-Painted Roofing",
      "Color Roof / Pre-Painted Corrugated", "Spandrel Ceiling Roof",
      "Polycarbonate Sheet Roofing", "Concrete Flat Deck Roof",
      "Metal Stone-Coated / Tile Roof"
    ];
    const idx = ROOF_TYPES.findIndex(r => r !== "" && rawData.roofType.toLowerCase().startsWith(r.toLowerCase().split(" ")[0]));
    if (idx > 0) rawData.roofType = idx;
  }

  // Derive numeric dimension fields
  rawData.floorArea = (parseFloat(rawData.length || rawData.groundLength || 0) || 0) *
                     (parseFloat(rawData.width  || rawData.groundWidth  || 0) || 0);

  let estimate;
  try {
    // Temporarily remove budget from rawData so generateEstimate doesn't
    // artificially scale down the quantities during budget reconciliation.
    // The live budget meter should always show the TRUE raw cost of choices.
    const tempBudget = rawData.budget;
    rawData.budget = 0; 
    
    estimate = generateEstimate(rawData);
    
    rawData.budget = tempBudget; // Restore for later checks
  } catch (e) {
    console.warn("[LiveBudget] Estimate error:", e);
    return;
  }

  if (estimate.error) return;

  const grandTotal  = estimate.summary.grandTotal;
  const pct         = budget > 0 ? Math.min((grandTotal / budget) * 100, 150) : 0;
  const barEl       = document.getElementById("bw-lbp-bar");
  const usedEl      = document.getElementById("bw-lbp-used");
  const totalEl     = document.getElementById("bw-lbp-total");
  const statusEl    = document.getElementById("bw-lbp-status");
  const pctEl       = document.getElementById("bw-lbp-pct");

  if (!barEl) return;

  usedEl.textContent  = currency.format(grandTotal);
  totalEl.textContent = currency.format(budget);
  pctEl.textContent   = `${Math.round(pct)}%`;

  // Clamp bar to 100% visually (overflow shown via color)
  barEl.style.width = `${Math.min(pct, 100)}%`;

  // ── Color & status logic ───────────────────────────────────────────────
  const panel = document.getElementById("bw-live-budget-panel");

  if (pct > 100) {
    // OVER BUDGET
    barEl.className    = "bw-lbp-bar bw-lbp-bar--over";
    statusEl.textContent = `Over budget by ${currency.format(grandTotal - budget)}`;
    panel.classList.remove("bw-lbp--ok", "bw-lbp--warning");
    panel.classList.add("bw-lbp--over");

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.title = "";
    }

    if (!toastShown) {
      toastShown = true;
      showBudgetToast("Budget exceeded! Please reduce dimensions or material grade.", "danger");
    }

  } else if (pct >= 85) {
    // NEAR LIMIT
    barEl.className    = "bw-lbp-bar bw-lbp-bar--warning";
    const remaining    = budget - grandTotal;
    statusEl.textContent = `Remaining: ${currency.format(remaining)} — getting close!`;
    panel.classList.remove("bw-lbp--ok", "bw-lbp--over");
    panel.classList.add("bw-lbp--warning");

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.title = "";
    }

    if (!toastShown) {
      toastShown = true;
      showBudgetToast(`Only ${currency.format(remaining)} left in your budget. Choose carefully.`, "warning");
    }

  } else {
    // OK
    barEl.className    = "bw-lbp-bar bw-lbp-bar--ok";
    const remaining    = budget - grandTotal;
    statusEl.textContent = `Remaining: ${currency.format(remaining)}`;
    panel.classList.remove("bw-lbp--warning", "bw-lbp--over");
    panel.classList.add("bw-lbp--ok");

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.title = "";
    }

    toastShown = false;
  }
}

// ── Entry point ────────────────────────────────────────────────────────────

/**
 * Initializes the live budget meter on the configure form.
 * @param {HTMLFormElement} form
 * @param {string} typeKey  — house type key
 * @param {Object} setupData — from localStorage (must have .budget)
 */
export function initLiveBudgetMeter(form, typeKey, setupData) {
  const budget = Number((setupData && setupData.budget) || 0);
  if (!budget) return; // No budget set, skip

  const submitBtn = form.querySelector(".create-plan-button");

  // Inject the meter panel into the DOM (after the form footer)
  const panel = createMeterPanel();
  const formFooter = form.querySelector(".config-form-footer, .config-footer-budget, .form-footer");
  if (formFooter) {
    formFooter.parentNode.insertBefore(panel, formFooter);
  } else {
    form.appendChild(panel);
  }

  // Debounce helper — prevents hammering the estimator on rapid slider drags
  let debounceTimer = null;
  function debouncedUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => updateMeter(form, typeKey, budget, submitBtn), 350);
  }

  // Run initial estimate immediately on load
  updateMeter(form, typeKey, budget, submitBtn);

  // Wire to any form change
  form.addEventListener("change",  debouncedUpdate);
  form.addEventListener("input",   debouncedUpdate);
}

/* ============================================================
   form-wiring.js — All UI wiring functions for configure page
   Used by: scripts/configure/configure.js
   ============================================================ */

import { houseTypes, currency } from '../house-data.js';

/* --- Advanced Mode Toggle ---------------------------------- */

export function injectAdvancedModeToggle(form) {
  const sections = form.querySelectorAll('.form-section');
  if (sections.length === 0) return;

  // Hide only the finishes/tiling sections (index 3 and beyond) in basic mode.
  // Sections 0 (shared costing — soil condition, material grade, roof type),
  // 1 (dimensions), and 2 (rooms) are always shown.
  sections.forEach((sec, index) => {
    if (index >= 3) {
      sec.classList.add('advanced-setting');
      sec.style.display = 'none';
    }
  });

  const intro = form.querySelector('.form-intro');
  if (intro) {
    const toggleHtml = `
      <div class="bw-mode-banner">
        <div class="bw-mode-banner-text">
          <strong>Basic Mode</strong>
          <span>Only Dimensions &amp; Rooms shown. The system optimizes the rest.</span>
        </div>
        <label class="bw-mode-switch">
          <input type="checkbox" id="advancedModeToggle">
          <span class="bw-mode-track"></span>
          <span class="bw-mode-label">Advanced Options</span>
        </label>
      </div>
    `;
    intro.insertAdjacentHTML('afterend', toggleHtml);

    const toggle = form.querySelector('#advancedModeToggle');
    const banner = form.querySelector('.bw-mode-banner');
    const bannerTitle = banner.querySelector('strong');
    toggle.addEventListener('change', (e) => {
      const isAdvanced = e.target.checked;
      form.querySelectorAll('.advanced-setting').forEach(sec => {
        sec.style.display = isAdvanced ? 'block' : 'none';
      });
      bannerTitle.textContent = isAdvanced ? 'Advanced Mode' : 'Basic Mode';
      banner.classList.toggle('bw-mode-banner--advanced', isAdvanced);
    });
  }
}

/* --- Toggle Switch Wiring ---------------------------------- */

/**
 * Syncs each hidden input + status label to its toggle checkbox.
 * Runs once on form mount.
 */
export function wireToggleSwitches(form) {
  form.querySelectorAll(".bw-toggle-input").forEach((checkbox) => {
    const hidden = checkbox.closest(".bw-toggle").querySelector('input[type="hidden"]');
    const status = checkbox.closest(".bw-toggle").querySelector(".bw-toggle-status");
    if (!hidden) return;

    function sync() {
      hidden.value = checkbox.checked ? checkbox.dataset.on : checkbox.dataset.off;
      if (status) status.textContent = checkbox.checked ? "Yes" : "No";
      // Dispatch a change event on the hidden input so FormData-based listeners
      // (e.g. live-budget meter) immediately pick up the new value.
      hidden.dispatchEvent(new Event("change", { bubbles: true }));
    }

    checkbox.addEventListener("change", sync);
  });
}

/* --- Conditional Field UI Logic ---------------------------- */

export function wireConditionalFields(form) {
  function updateVisibility() {
    const formData = new FormData(form);

    const applyTilesGround  = formData.get("applyTilesGround")  === "Yes";
    const applyTilesSecond  = formData.get("applyTilesSecond")  === "Yes";
    const showTiles         = applyTilesGround || applyTilesSecond;

    const groundFloorCeiling  = formData.get("groundFloorCeiling")  === "Yes";
    const mezzanineCeiling    = formData.get("mezzanineCeiling")    === "Yes";
    const showLoftCeiling     = groundFloorCeiling || mezzanineCeiling;

    const ceilingGroundFloor    = formData.get("ceilingGroundFloor")  === "Yes";
    const ceilingSecondFloor    = formData.get("ceilingSecondFloor")  === "Yes";
    const showTwoStoreyCeiling  = ceilingGroundFloor || ceilingSecondFloor;

    const hasCeiling       = formData.get("hasCeiling")       === "Yes";
    const includePainting  = formData.get("includePainting")  === "Yes";
    const paintGroundFloor = formData.get("paintGroundFloor") === "Yes";
    const paintSecondFloor = formData.get("paintSecondFloor") === "Yes";

    form.querySelectorAll('.conditional-field').forEach(field => {
      const condition = field.dataset.condition;
      let isVisible = false;

      if      (condition === 'showTiles')           isVisible = showTiles;
      else if (condition === 'showLoftCeiling')     isVisible = showLoftCeiling;
      else if (condition === 'showTwoStoreyCeiling')isVisible = showTwoStoreyCeiling;
      else if (condition === 'hasCeiling')          isVisible = hasCeiling;
      else if (condition === 'includePainting')     isVisible = includePainting;
      else if (condition === 'paintGroundFloor')    isVisible = paintGroundFloor;
      else if (condition === 'paintSecondFloor')    isVisible = paintSecondFloor;
      else                                           isVisible = true;

      field.style.display = isVisible ? '' : 'none';
      field.querySelectorAll('input, select').forEach(input => {
        input.disabled = !isVisible;
      });
    });
  }

  form.querySelectorAll(".bw-toggle-input").forEach((checkbox) => {
    // Run visibility update synchronously AFTER wireToggleSwitches has already
    // updated the hidden input value (sync runs first, then this listener).
    // Using setTimeout(0) ensured the hidden value was set before we read FormData.
    // Now that wireToggleSwitches dispatches a change event on the hidden input,
    // we need to avoid double-running; simply listen on the checkbox change.
    checkbox.addEventListener("change", () => {
      // Hidden input has already been updated by wireToggleSwitches at this point
      // (same-tick synchronous handler). Run visibility update immediately.
      updateVisibility();
    });
  });

  updateVisibility();
}

/* --- Budget Input Formatting ------------------------------- */

/**
 * Formats a numeric string with comma separators.
 */
function formatBudgetValue(val) {
  let clean = val.replace(/[^\d]/g, "");
  clean = clean.replace(/^0+(?=\d)/, "");
  if (!clean || clean === "0") return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Attaches live formatting to the budget input and preserves cursor position.
 */
export function wireBudgetInput(form) {
  const budgetInput = form.querySelector('[name="budgetInput"]');
  if (!budgetInput) return;

  const submitBtn = form.querySelector('.create-plan-button');
  const typeKey = form.dataset.type;
  const configLimits = houseTypes[typeKey];

  let alertDiv = form.querySelector('.budget-alert-message');
  if (!alertDiv) {
    alertDiv = document.createElement('div');
    alertDiv.className = 'budget-alert-message mt-2 small text-danger fw-medium';
    alertDiv.style.display = 'none';
    const wrap = form.querySelector('.config-footer-budget');
    if (wrap) wrap.appendChild(alertDiv);
  }

  function validateBudget() {
    const rawVal = budgetInput.value.replace(/[^\d]/g, "");
    if (!rawVal) {
      alertDiv.style.display = 'none';
      budgetInput.classList.remove('is-invalid');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const budgetNum = Number(rawVal);
    if (configLimits) {
      if (budgetNum < configLimits.minBudget) {
        alertDiv.textContent = `Insufficient budget. The minimum allowable budget for ${configLimits.title} is ${currency.format(configLimits.minBudget)}.`;
        alertDiv.style.display = 'block';
        budgetInput.classList.add('is-invalid');
        if (submitBtn) submitBtn.disabled = true;
      } else if (configLimits.maxBudget && budgetNum > configLimits.maxBudget) {
        alertDiv.textContent = `Budget is higher than the allowable limit. The maximum for ${configLimits.title} is ${currency.format(configLimits.maxBudget)}. Consider a more premium configuration.`;
        alertDiv.style.display = 'block';
        budgetInput.classList.add('is-invalid');
        if (submitBtn) submitBtn.disabled = true;
      } else {
        alertDiv.style.display = 'none';
        budgetInput.classList.remove('is-invalid');
        if (submitBtn) submitBtn.disabled = false;
      }
    }
  }

  budgetInput.value = formatBudgetValue(budgetInput.value);
  validateBudget();

  budgetInput.addEventListener("input", function () {
    this.setCustomValidity("");

    const originalValue      = this.value;
    const selectionStart     = this.selectionStart;
    const digitsBeforeCursor = originalValue
      .slice(0, selectionStart)
      .replace(/[^\d]/g, "").length;

    const formatted = formatBudgetValue(originalValue.replace(/[^\d]/g, ""));
    this.value      = formatted;

    let newPos = 0;
    let seen   = 0;
    while (newPos < formatted.length && seen < digitsBeforeCursor) {
      if (formatted[newPos] !== ",") seen++;
      newPos++;
    }
    this.setSelectionRange(newPos, newPos);
    validateBudget();
  });

  budgetInput.addEventListener("blur", function () {
    this.value = formatBudgetValue(this.value.replace(/[^\d]/g, ""));
    validateBudget();
  });
}

/* --- Custom Paint Color Theme ------------------------------ */

export function wireCustomPaintInput(form) {
  const select = form.querySelector('[name="paintColorTheme"]');
  if (!select) return;

  const container = document.createElement("div");
  container.className = "mt-2 custom-paint-container";
  container.hidden = true;

  const input = document.createElement("input");
  input.type = "text";
  input.name = "customPaintColorTheme";
  input.className = "form-control";
  input.placeholder = "Enter custom color";

  container.appendChild(input);
  select.parentNode.appendChild(container);

  select.addEventListener("change", () => {
    const isCustom = select.value.includes("Custom");
    container.hidden = !isCustom;
    if (isCustom) {
      input.required = true;
      input.focus();
    } else {
      input.required = false;
      input.value = "";
    }
  });
}

/* --- Floor Area Live Display ------------------------------- */

export function wireFloorAreaDisplay(form) {
  const l1Input = form.querySelector('[name="length"], [name="groundLength"]');
  const w1Input = form.querySelector('[name="width"], [name="groundWidth"]');
  const l2Input = form.querySelector('[name="secondFloorLength"], [name="mezzanineLength"]');
  const w2Input = form.querySelector('[name="secondFloorWidth"], [name="mezzanineWidth"]');

  if (!l1Input || !w1Input) return;

  const container = document.createElement("div");
  container.className = "col-12 mt-3";
  container.innerHTML = `
    <div class="alert alert-success d-flex align-items-center py-2 mb-0" style="background-color: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32;">
      <strong class="me-2">Estimated Total Floor Area:</strong>
      <span id="liveFloorAreaDisplay">0.00 sqm</span>
    </div>
  `;

  const dimSection = l1Input.closest(".row");
  if (dimSection) dimSection.appendChild(container);

  function updateArea() {
    let total = (parseFloat(l1Input.value) || 0) * (parseFloat(w1Input.value) || 0);
    if (l2Input && w2Input) {
      total += (parseFloat(l2Input.value) || 0) * (parseFloat(w2Input.value) || 0);
    }
    const display = container.querySelector("#liveFloorAreaDisplay");
    if (display) display.textContent = total.toFixed(2) + " sqm";
  }

  l1Input.addEventListener("input", updateArea);
  w1Input.addEventListener("input", updateArea);
  if (l2Input && w2Input) {
    l2Input.addEventListener("input", updateArea);
    w2Input.addEventListener("input", updateArea);
  }

  updateArea();
}

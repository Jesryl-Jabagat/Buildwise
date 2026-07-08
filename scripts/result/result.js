/* ============================================================
   result.js — Result page setup & boot
   Page: pages/result.html
   Depends on: house-data.js (global), utils.js (global),
               result-renderers.js, estimator/aggregator.js
   ============================================================ */

import { houseTypes, currency, currentTypeKey } from "../house-data.js";
import { setText } from "../utils.js";
import { generateEstimate } from "../estimator/aggregator.js";
import {
  writeLayoutList,
  writeBudgetBars,
  writeMaterialsTable,
  writeConstructionPhases,
  writeLaborBreakdown,
  setGeneratedImages,
} from "./result-renderers.js";
import { initRenderer } from "./renderer3d.js";

/* --- Page Setup -------------------------------------------- */

/**
 * Main entry point for the result page.
 * Reads saved data from localStorage (written by configure.js)
 * and populates all visible sections.
 */
function setupResultPage() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem("buildwiseResult") || "null");
  } catch (e) {
    console.error("Failed to parse buildwiseResult from localStorage:", e);
  }

  const fallbackType = houseTypes[currentTypeKey()];

  const data = stored || {
    typeKey:        currentTypeKey(),
    title:          fallbackType.title,
    description:    fallbackType.description,
    image:          fallbackType.image,
    floorArea:      80,
    lotArea:        120,
    bedrooms:       2,
    bathrooms:      2,
    familySize:     "Small family",
    timeline:       "Within 6 months",
    kitchenStyle:   "Open kitchen",
    budget:         1500000,
    mainMaterial:   fallbackType.material[0],
    roofStyle:      "Long span pre-painted",
    finishLevel:    "Balanced family comfort",
    layoutPriority: "Open kitchen",
    porch:          true,
    garage:         false,
    storage:        true,
    solarReady:     false,
    laundry:        true,
    workCorner:     false,
    soilCondition:  "Medium / Standard (Typical Inland Soil / Loose Clay)",
  };

  // Patch old cached decimal percentages back to whole numbers
  if (data.tileBreakage > 0 && data.tileBreakage <= 1) {
    data.tileBreakage = data.tileBreakage * 100;
  }
  if (data.ceilingWastage > 0 && data.ceilingWastage <= 1) {
    data.ceilingWastage = data.ceilingWastage * 100;
  }

  const budget    = Number(data.budget) || 1500000;
  const roomCount = Number(data.bedrooms) + Number(data.bathrooms);

  setText("resultTitle",    `${data.title} plan for ${(data.familySize || "your family").toLowerCase()}`);
  setText("resultSubtitle", `A ${data.floorArea} sqm home concept with ${data.bedrooms} bedroom(s), ${data.bathrooms} bathroom(s), and ${(data.finishLevel || "standard finish").toLowerCase()}.`);
  setText("targetBudget",   currency.format(budget));
  setText("resultArea",     `${data.floorArea} sqm`);
  setText("resultRooms",    `${roomCount} rooms`);
  setText("resultFamily",   data.familySize || "Your family");
  setText("layoutSummary",  `BuildWise recommends a simple, easy-to-build layout using ${(data.mainMaterial || fallbackType.material[0] || "standard materials").toLowerCase()} and a ${(data.roofStyle || "standard roof").toLowerCase()}.`);

  const configLink = document.getElementById("backToConfig");
  if (configLink) {
    configLink.href = `configure.html?type=${encodeURIComponent(data.typeKey)}`;
  }

  writeLayoutList(data);

  // Run Estimator
  const estimateData = generateEstimate(data);

  if (estimateData.error) {
    console.error("Estimation error:", estimateData.error);
    setText("totalCostEstimate", "Estimation Error");
    setText("remainingBudget", "N/A");
    
    const feasibilityNote = document.createElement("div");
    feasibilityNote.className = "alert mt-3 mb-0 alert-danger";
    feasibilityNote.style.fontSize = "14px";
    feasibilityNote.innerHTML = `<strong>Error:</strong> ${estimateData.error}`;
    const heroCopy = document.querySelector(".plan-hero-copy");
    if (heroCopy) heroCopy.appendChild(feasibilityNote);
  } else {
    // Total Cost Estimate
    setText("totalCostEstimate", currency.format(estimateData.summary.grandTotal));

    // Remaining Budget
    const remainingBudget = budget - estimateData.summary.grandTotal;
    setText("remainingBudget", currency.format(remainingBudget));

    const remainingBudgetBox = document.getElementById("remainingBudgetBox");
    if (remainingBudgetBox) {
      if (remainingBudget < 0) {
        remainingBudgetBox.classList.add("stat-card--over-budget");
        document.getElementById("remainingBudget").classList.add("stat-value--over-budget");
      } else {
        remainingBudgetBox.classList.add("stat-card--remaining");
        document.getElementById("remainingBudget").classList.add("stat-value--remaining");
      }
    }

    // Feasibility Note
    const feasibilityNote = document.createElement("div");
    feasibilityNote.className = "alert mt-3 mb-0";
    feasibilityNote.style.fontSize = "14px";

    if (estimateData.feasibility.status.includes("[OK]"))          feasibilityNote.classList.add("alert-success");
    else if (estimateData.feasibility.status.includes("[WARNING]"))feasibilityNote.classList.add("alert-warning");
    else                                                            feasibilityNote.classList.add("alert-secondary");

    feasibilityNote.innerHTML = `<strong>${estimateData.feasibility.status}</strong>: ${estimateData.feasibility.message}`;

    const heroCopy = document.querySelector(".plan-hero-copy");
    if (heroCopy) heroCopy.appendChild(feasibilityNote);

    // Materials Table
    writeMaterialsTable(estimateData.materialsList);

    // Budget Bars
    const colorClasses = ["bg-success", "bg-info", "bg-warning", "bg-primary", "bg-secondary", "bg-dark"];
    const budgetRows   = estimateData.materialsList.map((cat, idx) => [cat.category, cat.total, colorClasses[idx % colorClasses.length]]);
    budgetRows.push(["Labor Estimate",    estimateData.summary.laborEstimate, "bg-secondary"]);
    budgetRows.push(["Contingency (10%)", estimateData.summary.contingency,   "bg-danger"]);

    writeBudgetBars(budgetRows, estimateData.summary.grandTotal);

    // Budget Reconciliation Banner
    if (estimateData.reconciliationNote) {
      const reconcileBanner = document.getElementById("budget-reconciliation-banner");
      if (reconcileBanner) {
        reconcileBanner.style.display = "flex";
        reconcileBanner.innerHTML = `
          <span style="font-size:1.2rem; margin-right: 10px;">⚙️</span>
          <div>
            <strong>Auto-Adjusted to Fit Budget</strong><br>
            <span style="font-size:0.88rem;">${estimateData.reconciliationNote}</span>
          </div>`;
      }
    }

    // Forecasting
    if (estimateData.forecasting) {
      setText("workerCount", `${estimateData.forecasting.stats.workers} workers`);
      setText("buildDays",   `${estimateData.forecasting.stats.buildDays} days`);
      writeConstructionPhases(estimateData.forecasting.phases);
    }
    
    // Labor Breakdown
    if (estimateData.summary && estimateData.summary.laborBreakdown) {
      writeLaborBreakdown(estimateData.summary.laborBreakdown);
    }

  }

  // Initialize 3D renderer
  initRenderer(data);
}

/* --- Backend Integration API ------------------------------- */

// Expose integration API globally for future backend use
window.BuildWiseResult = {
  setGeneratedImages,
  writeConstructionPhases,
  writeMaterialsTable,
};

/* --- Boot -------------------------------------------------- */
if (document.querySelector(".friendly-result-page")) {
  setupResultPage();
}

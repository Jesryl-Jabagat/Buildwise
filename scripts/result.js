/* ============================================================
   result.js — Result page rendering
   Page: pages/result.html
   Depends on: house-data.js, utils.js
   ============================================================ */

import { generateEstimate } from "./estimator/aggregator.js";


/* --- Page Setup -------------------------------------------- */

// Integrated with backend estimator.js
// No longer uses dummy split percentages.

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
    length:         10,
    width:          8,
    wallHeight:     2.7,
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

  const budget      = Number(data.budget) || 1500000;
  const roomCount   = Number(data.bedrooms) + Number(data.bathrooms);

  setText("resultTitle",    `${data.title} plan for ${data.familySize.toLowerCase()}`);
  setText("resultSubtitle", `A ${data.floorArea} sqm home concept with ${data.bedrooms} bedroom(s), ${data.bathrooms} bathroom(s), and ${data.finishLevel.toLowerCase()}.`);
  setText("targetBudget",   currency.format(budget)); // Fixed ID
  setText("resultArea",     `${data.floorArea} sqm`);
  setText("resultRooms",    `${roomCount} rooms`);
  setText("resultFamily",   data.familySize);
  setText("layoutSummary",  `BuildWise recommends a simple, easy-to-build layout using ${data.mainMaterial.toLowerCase()} and a ${data.roofStyle.toLowerCase()}.`);

  // Exterior render will remain a blank placeholder until generated

  const configLink = document.getElementById("backToConfig");
  if (configLink) {
    configLink.href = `configure.html?type=${encodeURIComponent(data.typeKey)}`;
  }

  writeLayoutList(data);

  // Run Estimator
  const estimateData = generateEstimate(data);
  
  if (estimateData.error) {
    console.error("Estimator Error:", estimateData.error);
    setText("totalCostEstimate", "Error");
    setText("remainingBudget", "Error");
    return;
  }
  
  // Set Total Cost Estimate
  setText("totalCostEstimate", currency.format(estimateData.summary.grandTotal));
  
  // Set Remaining Budget
  const remainingBudget = budget - estimateData.summary.grandTotal;
  setText("remainingBudget", currency.format(remainingBudget));
  
  const remainingBudgetBox = document.getElementById("remainingBudgetBox");
  if (remainingBudgetBox) {
    if (remainingBudget < 0) {
      remainingBudgetBox.style.backgroundColor = "#ffebee";
      remainingBudgetBox.style.borderColor = "#ffcdd2";
      document.getElementById("remainingBudget").style.color = "#c62828";
    } else {
      remainingBudgetBox.style.backgroundColor = "#e3f2fd";
      remainingBudgetBox.style.borderColor = "#bbdefb";
      document.getElementById("remainingBudget").style.color = "#1565c0";
    }
  }
  
  // Feasibility Check Display
  const feasibilityNote = document.createElement("div");
  feasibilityNote.className = "alert mt-3 mb-0";
  feasibilityNote.style.fontSize = "14px";
  
  if (estimateData.feasibility.status.includes("[OK]")) {
    feasibilityNote.classList.add("alert-success");
  } else if (estimateData.feasibility.status.includes("[WARNING]")) {
    feasibilityNote.classList.add("alert-warning");
  } else {
    feasibilityNote.classList.add("alert-secondary"); // Changed from danger to secondary
  }
  feasibilityNote.innerHTML = `<strong>${estimateData.feasibility.status}</strong>: ${estimateData.feasibility.message}`;
  
  const heroCopy = document.querySelector(".plan-hero-copy");
  if (heroCopy) {
    heroCopy.appendChild(feasibilityNote);
  }

  // Materials Table
  writeMaterialsTable(estimateData.materialsList);
  
  // Budget Bars
  const colorClasses = ["bg-success", "bg-info", "bg-warning", "bg-primary", "bg-secondary", "bg-dark"];
  const budgetRows = estimateData.materialsList.map((cat, idx) => {
    return [cat.category, cat.total, colorClasses[idx % colorClasses.length]];
  });
  budgetRows.push(["Labor Estimate", estimateData.summary.laborEstimate, "bg-secondary"]);
  budgetRows.push(["Contingency (10%)", estimateData.summary.contingency, "bg-danger"]);
  
  writeBudgetBars(budgetRows, estimateData.summary.grandTotal);

  // Forecasting Display
  if (estimateData.forecasting) {
    setText("workerCount", `${estimateData.forecasting.stats.workers} workers`);
    setText("buildDays", `${estimateData.forecasting.stats.buildDays} days`);
    writeConstructionPhases(estimateData.forecasting.phases);
  }
}

/* --- Write Helpers ----------------------------------------- */

/**
 * Renders a definition-list breakdown into a container by ID.
 * NOTE: Currently unused — preserved for future use.
 */
function writeBreakdown(id, rows) {
  const list = document.getElementById(id);
  if (!list) return;
  list.innerHTML = rows
    .map(
      ([term, detail]) => `
      <div>
        <dt>${term}</dt>
        <dd>${detail}</dd>
      </div>
    `,
    )
    .join("");
}

/**
 * Renders the recommended layout summary list items.
 */
function writeLayoutList(data) {
  const list = document.getElementById("layoutList");
  if (!list) return;

  const items = [
    `${data.kitchenStyle} connected to the main living area`,
    `${data.bedrooms} bedroom(s) with ${data.bathrooms} bathroom(s)`,
    `${data.finishLevel} for the first design version`,
    `${data.timeline} target timeline`,
    `${data.lotArea} sqm lot with ${data.floorArea} sqm target floor area`,
  ];

  list.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

/**
 * Renders the budget breakdown bar chart.
 * @param {Array} rows  - [[label, value, cssClass], ...]
 * @param {number} total - total budget for percentage width
 */
function writeBudgetBars(rows, total) {
  const container = document.getElementById("budgetBars");
  if (!container) return;

  container.innerHTML = rows
    .map(([label, value, className]) => {
      const percent = Math.max(4, Math.round((value / total) * 100));
      return `
        <div class="budget-bar-row">
          <div>
            <span>${label}</span>
            <strong>${currency.format(value)}</strong>
          </div>
          <div class="budget-bar-track">
            <i class="${className}" style="width: ${percent}%"></i>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * Renders the selected feature pills.
 * Falls back to "Simple starter plan" if no features are active.
 */
function writeFeaturePills(data) {
  const container = document.getElementById("featurePills");
  if (!container) return;

  const features = [
    ["Front porch",      data.porch],
    ["Carport",          data.garage],
    ["Extra storage",    data.storage],
    ["Solar-ready roof", data.solarReady],
    ["Laundry area",     data.laundry],
    ["Work corner",      data.workCorner],
  ]
    .filter(([, active]) => active)
    .map(([label]) => label);

  container.innerHTML = (features.length ? features : ["Simple starter plan"])
    .map((f) => `<span>${f}</span>`)
    .join("");
}

/* --- Backend Integration API ------------------------------- */

/**
 * Utility to display an image and hide its skeleton placeholder.
 */
function showImage(imgId, placeholderId, url) {
  const img = document.getElementById(imgId);
  const placeholder = document.getElementById(placeholderId);
  if (img && url) {
    img.src = url;
    img.hidden = false;
    if (placeholder) {
      placeholder.hidden = true;
    }
  }
}

/**
 * Updates the exterior render and floor plan images.
 * Exposes a clean function for the future AI generation backend.
 */
function setGeneratedImages({ houseRenderUrl, floorPlanUrl }) {
  showImage("houseRenderImg", "houseRenderPlaceholder", houseRenderUrl);
  showImage("floorPlanImg",   "floorPlanPlaceholder",   floorPlanUrl);
}

/**
 * Renders the construction timeline rows.
 * @param {Array} phases - [{ name, days, workers }, ...]
 */
function writeConstructionPhases(phases) {
  const container = document.getElementById("constructionPhases");
  if (!container || !phases?.length) return;

  container.innerHTML = phases
    .map(
      (phase) => `
      <div class="phase-row">
        <span class="phase-name">${phase.name}</span>
        <span class="phase-days">${phase.days} days</span>
        <span class="phase-workers">${phase.workers} workers</span>
      </div>
    `,
    )
    .join("");

  const note = document.getElementById("timelineNote");
  if (note) note.hidden = true;
}

/**
 * Renders the detailed materials list table.
 * @param {Array} materials - [{ category, items: [{ name, qty, unit, unitCost, total }] }, ...]
 */
function writeMaterialsTable(materials) {
  const container = document.getElementById("materialsTable");
  if (!container || !materials?.length) return;

  const note = document.getElementById("materialsNote");
  if (note) note.hidden = true;

  container.innerHTML = materials
    .map(
      (group) => `
      <div class="materials-group">
        <h3 class="materials-category">${group.category}</h3>
        <table class="materials-tbl">
          <thead>
            <tr>
              <th style="width: 40%;">Material</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 15%;">Unit</th>
              <th style="width: 15%; text-align: right;">Unit Cost</th>
              <th style="width: 15%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${group.items
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: center;">${item.qty}</td>
                <td>${item.unit}</td>
                <td style="text-align: right;">${currency.format(item.unitCost)}</td>
                <td style="text-align: right;">${currency.format(item.total)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `,
    )
    .join("");
}

// Expose integration API globally for future backend use
window.BuildWiseResult = {
  setGeneratedImages,
  writeConstructionPhases,
  writeMaterialsTable,
};

/* --- Boot -------------------------------------------------- */
// Only runs on result.html — where .friendly-result-page exists.
if (document.querySelector(".friendly-result-page")) {
  setupResultPage();
}

/* ============================================================
   result-renderers.js — DOM rendering helpers for the result page
   Used by: scripts/result/result.js
   ============================================================ */

import { currency } from '../house-data.js';

/* --- Layout List ------------------------------------------- */

/**
 * Renders the recommended layout summary list items.
 */
export function writeLayoutList(data) {
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

/* --- Budget Bars ------------------------------------------- */

/**
 * Renders the budget breakdown bar chart.
 * @param {Array}  rows  - [[label, value, cssClass], ...]
 * @param {number} total - grand total used for percentage widths
 */
export function writeBudgetBars(rows, total) {
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

/* --- Materials Table --------------------------------------- */

/**
 * Renders the detailed materials list table.
 * @param {Array} materials - [{ category, items: [{ name, qty, unit, unitCost, total }] }]
 */
export function writeMaterialsTable(materials) {
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

/* --- Construction Timeline --------------------------------- */

/**
 * Renders the construction timeline phase rows.
 * @param {Array} phases - [{ name, days, workers }, ...]
 */
export function writeConstructionPhases(phases) {
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

/* --- Labor Breakdown --------------------------------------- */

/**
 * Renders the detailed labor breakdown table.
 * @param {Array} breakdown - [{ role, dailyWage, days, total }, ...]
 */
export function writeLaborBreakdown(breakdown) {
  const container = document.getElementById("laborBreakdownTable");
  if (!container || !breakdown?.length) return;

  container.innerHTML = `
    <table class="materials-tbl mt-3">
      <thead>
        <tr>
          <th style="width: 40%;">Labor Role (DOLE Std)</th>
          <th style="width: 20%; text-align: center;">Daily Wage</th>
          <th style="width: 20%; text-align: center;">Est. Days</th>
          <th style="width: 20%; text-align: right;">Total Bayad</th>
        </tr>
      </thead>
      <tbody>
        ${breakdown
          .map(
            (item) => `
          <tr>
            <td>${item.role}</td>
            <td style="text-align: center;">${currency.format(item.dailyWage)}</td>
            <td style="text-align: center;">${item.days}</td>
            <td style="text-align: right;">${currency.format(item.total)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

/* --- Image Helpers ----------------------------------------- */

/**
 * Utility to display an image and hide its skeleton placeholder.
 */
export function showImage(imgId, placeholderId, url) {
  const img         = document.getElementById(imgId);
  const placeholder = document.getElementById(placeholderId);
  if (img && url) {
    img.src    = url;
    img.hidden = false;
    if (placeholder) placeholder.hidden = true;
  }
}

/**
 * Updates the exterior render and floor plan images.
 * Exposed via window.BuildWiseResult for the future AI generation backend.
 */
export function setGeneratedImages({ houseRenderUrl, floorPlanUrl }) {
  showImage("houseRenderImg", "houseRenderPlaceholder", houseRenderUrl);
  showImage("floorPlanImg",   "floorPlanPlaceholder",   floorPlanUrl);
}

/* --- Budget Fit Badges ------------------------------------- */
export function writeBudgetFitBadges(budgetFit) {
  if (!budgetFit || budgetFit.status === "NO_BUDGET") return;
  const container = document.getElementById("budgetBars")?.parentElement;
  if (!container) return;
  
  const formatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (budgetFit.status === "UNDERFUNDED") {
    const el = document.createElement("div");
    el.className = "alert alert-danger mt-4";
    el.innerHTML = `<strong>⚠️ Budget Underfunded</strong><br>Your budget is significantly below the minimum floor cost of <strong>${formatter.format(budgetFit.floorCost)}</strong> required to build the basic structural core. Please increase your budget or reduce the floor area to proceed.`;
    container.insertBefore(el, document.getElementById("budgetBars"));
    return;
  }

  const badgeHtml = `
    <div class="mt-4 mb-4" style="background: var(--surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
      <h4 style="margin-top:0; margin-bottom: 1rem; font-size: 1rem; color: var(--text-muted);">Budget Fit Engine</h4>
      <div style="display:flex; flex-direction:column; gap: 0.8rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-left: 4px solid #f59e0b; padding-left: 10px;">
          <span><strong>🏗️ Core</strong> <span class="badge bg-success ms-2">${budgetFit.coreGrade}</span></span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-left: 4px solid #3b82f6; padding-left: 10px;">
          <span><strong>🔌 Utilities</strong> <span class="badge bg-secondary ms-2">${budgetFit.utilitiesGrade}</span></span>
          ${budgetFit.utilityFlags?.length ? '<span style="font-size:0.85rem; color:var(--bs-danger);">⚠️ Constrained</span>' : ''}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-left: 4px solid #10b981; padding-left: 10px;">
          <span><strong>🎨 Finishes</strong> <span class="badge bg-secondary ms-2">${budgetFit.finishesGrade}</span></span>
          <span style="font-size:0.85rem; color:var(--text-muted);">— Upgrades available</span>
        </div>
      </div>
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display:flex; justify-content:space-between; font-size:0.9rem;">
        <span><strong>Status:</strong> <span style="color:var(--bs-success)">${budgetFit.status}</span></span>
        <span><strong>Floor Cost:</strong> ${formatter.format(budgetFit.floorCost)}</span>
      </div>
    </div>
  `;
  
  const el = document.createElement("div");
  el.innerHTML = badgeHtml;
  container.insertBefore(el, document.getElementById("budgetBars"));
}

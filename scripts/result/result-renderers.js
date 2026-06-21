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

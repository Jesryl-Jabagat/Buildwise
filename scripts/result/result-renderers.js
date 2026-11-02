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
    .map((group) => {
      const isPkg = group.isPackage || group.category === "Plumbing" || group.category === "Electrical";
      if (isPkg) {
        const pkgName = group.category === "Plumbing" 
          ? "Complete Plumbing & Sanitary Package" 
          : "Complete Electrical & Wiring Package";
        const pkgDesc = group.category === "Plumbing"
          ? "PPR lines, sanitary orange pipes, drainage, standard fixtures, valves & fittings"
          : "THHN wires, flexible hose, conduit piping, switches, outlets, panel board & breakers";

        return `
        <div class="materials-group package-group" style="background: rgba(31, 122, 92, 0.03); border: 1px solid rgba(31, 122, 92, 0.2); border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 class="materials-category" style="margin: 0; color: #1f7a5c;">${pkgName}</h3>
                <span class="badge" style="background: #1f7a5c; color: #fff; font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; font-weight: 600; text-transform: uppercase;">Turnkey Package</span>
              </div>
              <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-muted);">${pkgDesc}</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); display: block;">Package Cost</span>
              <strong style="font-size: 1.15rem; color: #1f7a5c;">${currency.format(group.total)}</strong>
            </div>
          </div>

          <table class="materials-tbl" style="background: #fff; border-radius: 6px; overflow: hidden; margin-bottom: 10px;">
            <thead>
              <tr>
                <th style="width: 45%;">Scope / Package Item</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 15%;">Unit</th>
                <th style="width: 25%; text-align: right;">Package Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${pkgName}</strong><br><small style="color: var(--text-muted);">Includes all roughing-in, piping, devices & connection supplies</small></td>
                <td style="text-align: center; font-weight: 600;">1</td>
                <td>lot / package</td>
                <td style="text-align: right; font-weight: 700; color: #1f7a5c;">${currency.format(group.total)}</td>
              </tr>
            </tbody>
          </table>

          <details style="font-size: 0.84rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;">
            <summary style="cursor: pointer; font-weight: 600; color: #1f7a5c; outline: none; user-select: none;">
              📦 View Itemized Package Inclusions (${group.items.length} materials)
            </summary>
            <div style="margin-top: 10px; overflow-x: auto;">
              <table class="materials-tbl" style="margin: 0; font-size: 0.82rem;">
                <thead>
                  <tr style="background: #f8fafc;">
                    <th>Component Material</th>
                    <th style="text-align: center;">Est. Qty</th>
                    <th>Unit</th>
                    <th style="text-align: right;">Unit Ref.</th>
                    <th style="text-align: right;">Subtotal</th>
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
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      `;
      }

      // Default standard materials group
      return `
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
    `;
    })
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
    .map((phase) => {
      const isPkg = phase.isPackage || phase.workers === "Package" || String(phase.name).toLowerCase().includes("plumbing") || String(phase.name).toLowerCase().includes("elec.");
      const workerDisplay = isPkg
        ? `<span class="badge" style="background: rgba(31, 122, 92, 0.12); color: #1f7a5c; font-size: 0.75rem; padding: 4px 8px; border-radius: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Package</span>`
        : `${phase.workers} workers`;

      return `
      <div class="phase-row">
        <div>
          <span class="phase-name">${phase.name}</span>
          ${phase.crewDetails ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 3px;">👥 ${phase.crewDetails}</div>` : ''}
        </div>
        <span class="phase-days">${phase.days} days</span>
        <span class="phase-workers">${workerDisplay}</span>
      </div>
    `;
    })
    .join("");

  const note = document.getElementById("timelineNote");
  if (note) note.hidden = true;
}

/* --- Labor Breakdown --------------------------------------- */

/**
 * Renders the detailed labor breakdown table.
 * @param {Array} breakdown - [{ role, workers, dailyWage, days, total }, ...]
 */
export function writeLaborBreakdown(breakdown) {
  const container = document.getElementById("laborBreakdownTable");
  if (!container || !breakdown?.length) return;

  container.innerHTML = `
    <table class="materials-tbl mt-3">
      <thead>
        <tr>
          <th style="width: 35%;">Labor Role / Subcontract</th>
          <th style="width: 15%; text-align: center;">Workers</th>
          <th style="width: 15%; text-align: center;">Rate Basis</th>
          <th style="width: 15%; text-align: center;">Est. Days / Scope</th>
          <th style="width: 20%; text-align: right;">Total Bayad</th>
        </tr>
      </thead>
      <tbody>
        ${breakdown
          .map((item) => {
            const isPkg = item.isPackage || item.workers === "Package";
            const workersHtml = isPkg
              ? `<span class="badge" style="background: rgba(31, 122, 92, 0.12); color: #1f7a5c; font-size: 0.75rem; padding: 3px 6px; border-radius: 4px; font-weight: 700;">Package</span>`
              : (item.workers || 1);
            const wageHtml = isPkg
              ? `<span style="color: var(--text-muted); font-size: 0.8rem;">${item.dailyWage}</span>`
              : currency.format(item.dailyWage);
            const daysHtml = isPkg
              ? `<span style="color: var(--text-muted); font-size: 0.8rem;">${item.days}</span>`
              : item.days;

            return `
          <tr>
            <td>
              <div style="font-weight: 600;">${item.role}</div>
              ${item.phasesText ? `<div style="font-size: 0.75rem; color: var(--color-accent, #1f7a5c); margin-top: 2px;">📍 ${item.phasesText}</div>` : ''}
            </td>
            <td style="text-align: center; font-weight: 600;">${workersHtml}</td>
            <td style="text-align: center;">${wageHtml}</td>
            <td style="text-align: center;">${daysHtml}</td>
            <td style="text-align: right; font-weight: 600;">${currency.format(item.total)}</td>
          </tr>
        `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

/* --- Tools & Equipment List -------------------------------- */

/**
 * Renders the construction tools & equipment list table.
 * @param {Object} toolsData - { tools, totalCost, displayMode }
 */
export function writeToolsTable(toolsData) {
  const container = document.getElementById("toolsTable");
  if (!container || !toolsData?.tools?.length) return;

  const showPrice = toolsData.displayMode === "with-price";

  // Group by category
  const grouped = {};
  toolsData.tools.forEach(tool => {
    const cat = tool.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tool);
  });

  container.innerHTML = Object.entries(grouped)
    .map(([cat, items]) => `
      <div class="materials-group">
        <h3 class="materials-category">🛠️ ${cat}</h3>
        <table class="materials-tbl">
          <thead>
            <tr>
              <th style="width: ${showPrice ? '65%' : '80%'};">Tool / Equipment</th>
              ${showPrice 
                ? '<th style="width: 35%; text-align: right;">Estimated Unit Price</th>' 
                : '<th style="width: 20%; text-align: center;">Status</th>'}
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
              <tr>
                <td>${item.tool_key}</td>
                ${showPrice 
                  ? `<td style="text-align: right;">${currency.format(parseFloat(item.unit_price) || 0)}</td>` 
                  : `<td style="text-align: center;"><span class="badge bg-secondary">Included</span></td>`}
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `)
    .join("");
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

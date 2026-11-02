/* ============================================================
   configure.js — Configure page setup & boot
   Page: pages/configure.html
   Depends on: form-wiring.js, form-validation.js, templates/*
   ============================================================ */
import { houseTypes, currentTypeKey } from '../house-data.js';
import { setText } from '../utils.js';

import { getLoftTemplate }       from './templates/loft.template.js';
import { getTwoStoreyTemplate }  from './templates/two-storey.template.js';
import { getHalfMetalTemplate }  from './templates/half-metal.template.js';
import { getHalfAmakanTemplate } from './templates/half-amakan.template.js';
import { getChbTemplate }        from './templates/chb.template.js';

import {
  injectAdvancedModeToggle,
  wireToggleSwitches,
  wireConditionalFields,
  wireFloorAreaDisplay,
  wireBudgetInput,
  wireCustomPaintInput,
} from './form-wiring.js';

import { wireFormSubmit } from './form-validation.js';
import { initLiveBudgetMeter } from './live-budget.js';

/* --- Template Registry ------------------------------------- */

const TEMPLATES = {
  'loft':        getLoftTemplate,
  'two-storey':  getTwoStoreyTemplate,
  'half-metal':  getHalfMetalTemplate,
  'half-amakan': getHalfAmakanTemplate,
  'chb':         getChbTemplate,
};

/* --- Page Setup -------------------------------------------- */

/**
 * Main entry point for the configure page.
 * Reads the selected house type from the URL, populates the
 * sidebar summary, and mounts the matching config form.
 */
function setupConfigPage() {
  const typeKey  = currentTypeKey();
  const selected = houseTypes[typeKey];
  const mount    = document.getElementById("configFormMount");

  setText("selectedPill",        selected.pill);
  setText("selectedTitle",       selected.title);
  setText("selectedDescription", selected.description);

  const image = document.getElementById("selectedImage");
  if (image) {
    image.src = selected.image;
    image.alt = `${selected.title} preview`;
  }

  const getTemplate = TEMPLATES[typeKey];
  if (!getTemplate || !mount) {
    console.error(`Missing template for house type: ${typeKey}`);
    return;
  }

  mount.innerHTML = getTemplate();

  const form = mount.querySelector("form");

  injectAdvancedModeToggle(form);
  wireToggleSwitches(form);
  wireConditionalFields(form);
  wireFloorAreaDisplay(form);
  wireBudgetInput(form);
  wireCustomPaintInput(form);
  wireFormSubmit(form);

  // Initialize real-time live budget meter
  const setupDataForMeter = JSON.parse(localStorage.getItem('buildwiseSetup') || '{}')
  initLiveBudgetMeter(form, typeKey, setupDataForMeter);

  // Check if we are in AI mode
  const setupDataStr = localStorage.getItem('buildwiseSetup');
  if (setupDataStr) {
    const setupData = JSON.parse(setupDataStr);
    
    // Auto-fill area budget if available
    const budgetInput = form.querySelector('[name="budgetInput"]');
    if (budgetInput && setupData.budget) {
      budgetInput.value = setupData.budget;
      // Trigger input event to format
      budgetInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (setupData.mode === 'ai') {
      const isAnalyzingPage = window.location.pathname.includes('analyzing.html');
      
      // Import the AI module and start it
      import(`./ai-suggest.js?v=${Date.now()}`).then(module => {
        if (isAnalyzingPage) {
          module.startAiAnalyzing(form, typeKey, setupData);
        } else {
          module.startAiBuilder(form, typeKey, setupData);
        }
        
        // Prevent AI from running again if the user navigates back (Edit Choices)
        setupData.mode = 'manual';
        localStorage.setItem('buildwiseSetup', JSON.stringify(setupData));
      }).catch(err => {
        console.error("Failed to load AI Builder module", err);
        alert("Failed to load AI module. If you are opening this file locally (file:///), your browser might block ES modules. Try using Live Server. Error: " + err.message);
      });
    } else {
      // Pre-fill smart default dimensions and room counts from setup area
      if (setupData.area && setupData.area > 0) {
        // Smart footprint coverage (~65% to 75% for building code setbacks)
        const coverage = setupData.area <= 40 ? 0.75 : setupData.area <= 80 ? 0.70 : 0.65;
        let targetFootprint = setupData.area * coverage;
        if (setupData.budget && setupData.budget > 0) {
          const maxAffordable = setupData.budget / 14000;
          if (targetFootprint > maxAffordable) targetFootprint = Math.max(25, maxAffordable);
        }
        const length = Math.round(Math.sqrt(targetFootprint * 1.25) * 2) / 2;
        const width = Math.round((targetFootprint / length) * 2) / 2;
        
        const l1Input = form.querySelector('[name="length"], [name="groundLength"]');
        const w1Input = form.querySelector('[name="width"], [name="groundWidth"]');
        
        if (l1Input && w1Input) {
          l1Input.value = length;
          w1Input.value = width;
          l1Input.dispatchEvent(new Event('input', { bubbles: true }));
          w1Input.dispatchEvent(new Event('input', { bubbles: true }));
          l1Input.dispatchEvent(new Event('change', { bubbles: true }));
          w1Input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Pre-fill smart room counts based on footprint
        const isTwoStorey = typeKey === 'two-storey';
        const isLoft = typeKey === 'loft';

        let recBed1 = 1;
        let recCr1 = 1;
        let recBed2 = 0;
        let recCr2 = 0;

        if (isTwoStorey) {
          recBed1 = targetFootprint > 65 ? 1 : 0;
          recCr1 = 1;
          recBed2 = targetFootprint > 90 ? 3 : 2;
          recCr2 = targetFootprint > 70 ? 2 : 1;
        } else if (isLoft) {
          recBed1 = 1;
          recCr1 = 1;
          recBed2 = targetFootprint >= 45 ? 2 : 1;
          recCr2 = targetFootprint >= 50 ? 1 : 0;
        } else {
          // Single Storey (CHB, Half-Amakan, Half-Metal)
          recBed1 = targetFootprint <= 36 ? 1 : targetFootprint <= 60 ? 2 : targetFootprint <= 95 ? 3 : targetFootprint <= 140 ? 4 : 5;
          recCr1 = targetFootprint <= 60 ? 1 : targetFootprint <= 120 ? 2 : 3;
        }

        const b1 = form.querySelector('[name="bedrooms1F"]');
        const c1 = form.querySelector('[name="crs1F"]');
        const b2 = form.querySelector('[name="bedrooms2F"]');
        const c2 = form.querySelector('[name="crs2F"]');

        if (b1) { b1.value = String(recBed1); b1.dispatchEvent(new Event('change', { bubbles: true })); }
        if (c1) { c1.value = String(recCr1); c1.dispatchEvent(new Event('change', { bubbles: true })); }
        if (b2) { b2.value = String(recBed2); b2.dispatchEvent(new Event('change', { bubbles: true })); }
        if (c2) { c2.value = String(recCr2); c2.dispatchEvent(new Event('change', { bubbles: true })); }

        // Prefill non-spatial settings (materials, finishes) from previous result if any
        prefillFormFromLocalStorage(form, typeKey, true);
      } else {
        // In manual mode without area, pre-fill from previous result
        prefillFormFromLocalStorage(form, typeKey, false);
      }
    }
  } else {
    // If no setupDataStr at all, still try to prefill just in case
    prefillFormFromLocalStorage(form, typeKey, false);
  }
}

/**
 * Reads buildwiseResult from localStorage. If it matches the current house type,
 * it pre-fills the form fields so the user doesn't have to start from scratch.
 * @param {HTMLFormElement} form
 * @param {string} currentTypeKey
 * @param {boolean} ignoreSpatial If true, skips overwriting dimensions and room counts
 */
function prefillFormFromLocalStorage(form, currentTypeKey, ignoreSpatial = false) {
  try {
    const savedResult = localStorage.getItem('buildwiseResult');
    if (!savedResult) return;
    
    const data = JSON.parse(savedResult);
    if (data.typeKey !== currentTypeKey) return; // Only pre-fill if it's the same house type
    
    const spatialKeys = [
      "length", "width", "groundLength", "groundWidth",
      "secondFloorLength", "secondFloorWidth", "mezzanineLength", "mezzanineWidth",
      "bedrooms1F", "crs1F", "bedrooms2F", "crs2F"
    ];

    // Loop through all keys in the saved data and populate matching form fields
    for (const [key, value] of Object.entries(data)) {
      if (ignoreSpatial && spatialKeys.includes(key)) continue;
      const input = form.elements[key];
      if (!input) continue; // Skip if field doesn't exist in this template
      
      // Handle NodeList (e.g. radio buttons with the same name)
      if (input instanceof RadioNodeList || (input.length && !input.tagName)) {
        for (const radio of input) {
          if (radio.value === value) {
            radio.checked = true;
          }
        }
      } else if (input.type === 'checkbox') {
        input.checked = (value === 'Yes' || value === true || value === 'true' || value === 'on');
      } else {
        // Standard inputs (text, number, select, hidden)
        input.value = value;
      }
      
      // Dispatch events so live-budget and conditional-fields catch the change
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Special handling for the bw-toggle UI (since the actual input is hidden, we need to update the visual checkbox)
    form.querySelectorAll(".bw-toggle-input").forEach((checkbox) => {
      const hidden = checkbox.closest(".bw-toggle").querySelector('input[type="hidden"]');
      if (hidden && data[hidden.name] !== undefined) {
        checkbox.checked = (data[hidden.name] === checkbox.dataset.on);
        
        // Also update the status label visually
        const status = checkbox.closest(".bw-toggle").querySelector(".bw-toggle-status");
        if (status) status.textContent = checkbox.checked ? "Yes" : "No";
      }
    });

  } catch (e) {
    console.error("Failed to prefill form:", e);
  }
}

/* --- Boot -------------------------------------------------- */
if (document.getElementById("configFormMount")) {
  setupConfigPage();
}

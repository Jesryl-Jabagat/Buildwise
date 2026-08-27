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
      import('./ai-suggest.js').then(module => {
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
      // In manual mode, try to pre-fill from a previous result (Edit Choices flow)
      prefillFormFromLocalStorage(form, typeKey);
    }
  } else {
    // If no setupDataStr at all, still try to prefill just in case
    prefillFormFromLocalStorage(form, typeKey);
  }
}

/**
 * Reads buildwiseResult from localStorage. If it matches the current house type,
 * it pre-fills the form fields so the user doesn't have to start from scratch.
 */
function prefillFormFromLocalStorage(form, currentTypeKey) {
  try {
    const savedResult = localStorage.getItem('buildwiseResult');
    if (!savedResult) return;
    
    const data = JSON.parse(savedResult);
    if (data.typeKey !== currentTypeKey) return; // Only pre-fill if it's the same house type
    
    // Loop through all keys in the saved data and populate matching form fields
    for (const [key, value] of Object.entries(data)) {
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

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
    }
  }
}

/* --- Boot -------------------------------------------------- */
if (document.getElementById("configFormMount")) {
  setupConfigPage();
}

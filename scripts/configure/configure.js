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
}

/* --- Boot -------------------------------------------------- */
if (document.getElementById("configFormMount")) {
  setupConfigPage();
}

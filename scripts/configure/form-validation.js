/* ============================================================
   form-validation.js — Form data parsing and submit handler
   Used by: scripts/configure/configure.js
   Depends on: house-data.js (houseTypes — loaded as global or import)
   ============================================================ */

import { houseTypes } from '../house-data.js';

/* --- Form Data Parser -------------------------------------- */

/**
 * Collects, cleans, validates, and returns all form values as a data object.
 * Returns null if validation fails.
 */
export function getUserInput(form) {
  const submittedTypeKey = form.dataset.type;
  const submittedType    = houseTypes[submittedTypeKey];
  const formData         = new FormData(form);

  const data = {
    typeKey: submittedTypeKey,
    title:   submittedType.title,
  };

  let totalRooms = 0;
  let totalBaths = 0;

  for (let [key, value] of formData.entries()) {
    let cleanVal = value.trim();

    // Parse Budget
    if (key === "budgetInput") {
      const budgetNum = Number(cleanVal.replace(/,/g, ""));
      if (budgetNum <= 0) {
        alert("Please enter a valid total budget.");
        return null;
      }
      data.budget = budgetNum;
      continue;
    }

    // Convert "Yes"/"No" toggles to booleans
    if (cleanVal.startsWith("Yes")) { data[key] = true;  continue; }
    if (cleanVal.startsWith("No"))  { data[key] = false; continue; }

    // Convert numeric strings to numbers
    if (cleanVal !== "" && !isNaN(cleanVal)) {
      const num = parseFloat(cleanVal);
      data[key] = num;
      if (key.toLowerCase().includes("bedrooms")) totalRooms += num;
      if (key.toLowerCase().includes("crs"))      totalBaths += num;
      continue;
    }

    // Clean Tile Size (keep only the dimension, e.g. "30x30")
    if (key === "tileSize" && cleanVal.includes(" - ")) {
      data[key] = cleanVal.split(" ")[0];
      continue;
    }

    // Convert percentage strings (e.g. "10%" → 0.1)
    if (cleanVal.endsWith("%")) {
      data[key] = parseFloat(cleanVal.replace("%", "")) / 100;
      continue;
    }

    // Map Roof Type string → index number
    if (key === "roofType") {
      const roofTypes = [
        "",
        "Corrugated GI Sheet / Yero",
        "Long Span Pre-Painted Roofing",
        "Color Roof / Pre-Painted Corrugated",
        "Spandrel Ceiling Roof",
        "Polycarbonate Sheet Roofing",
        "Concrete Flat Deck Roof",
        "Metal Stone-Coated / Tile Roof"
      ];
      const idx = roofTypes.indexOf(cleanVal);
      if (idx > 0) {
        data[key]          = idx;
        data.roofStyle     = cleanVal;
        continue;
      }
    }

    data[key] = cleanVal;
  }

  /* --- Dimension Extraction & Validation ------------------- */
  const l1 = data.length || data.groundLength || 0;
  const w1 = data.width  || data.groundWidth  || 0;
  const l2 = data.secondFloorLength || data.mezzanineLength || 0;
  const w2 = data.secondFloorWidth  || data.mezzanineWidth  || 0;

  if (l1 > 0 && l1 < 1) { alert("Dimension must be at least 1 meter."); return null; }
  if (w1 > 0 && w1 < 1) { alert("Dimension must be at least 1 meter."); return null; }
  if (l2 > 0 && l2 < 1) { alert("Dimension must be at least 1 meter."); return null; }
  if (w2 > 0 && w2 < 1) { alert("Dimension must be at least 1 meter."); return null; }

  if (data.groundWallHeight  && data.groundWallHeight  < 2) { alert("Wall height must be at least 2 meters."); return null; }
  if (data.secondFloorWallHeight && data.secondFloorWallHeight < 2) { alert("Wall height must be at least 2 meters."); return null; }

  const gfArea   = l1 * w1;
  const mezzArea = l2 * w2;
  if (submittedTypeKey === "loft" && mezzArea > (0.5 * gfArea)) {
    alert("Mezzanine floor cannot exceed 50% of the ground floor area per building code.");
    return null;
  }

  data.lotArea   = Math.round(l1 * w1);
  data.floorArea = Math.round((l1 * w1) + (l2 * w2));

  /* --- UI Metadata for result.js --------------------------- */
  data.bedrooms     = totalRooms;
  data.bathrooms    = totalBaths;
  data.familySize   = totalRooms <= 2 ? "Small family" : totalRooms <= 4 ? "Growing family" : "Multi-generation family";
  data.timeline     = "Within 6 months";
  data.kitchenStyle = "Standard kitchen";
  data.finishLevel  = data.materialGrade || "Standard";
  data.mainMaterial = data.chbType || data.wallingMaterialType || submittedType.material[0];
  data.layoutPriority = "Engineer formula inputs";

  return data;
}

/* --- Form Submit Handler ----------------------------------- */

/**
 * Wires the form submit event: validates, saves to localStorage,
 * then redirects to the result page.
 */
export function wireFormSubmit(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = getUserInput(form);
    if (!data) return;

    console.log("Extracted Form Data:", data);

    localStorage.setItem("buildwiseResult", JSON.stringify(data));
    window.location.href = `result.html?type=${encodeURIComponent(data.typeKey)}`;
  });
}

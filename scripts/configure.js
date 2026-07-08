/* ============================================================
   configure.js — Configure page logic
   Page: pages/configure.html
   Depends on: house-data.js, utils.js, all configs/*.config.js
   ============================================================ */

/* --- Page Setup -------------------------------------------- */

/**
 * Main entry point for the configure page.
 * Reads the selected house type from the URL, populates the
 * sidebar summary, and mounts the matching config form template.
 */
function setupConfigPage() {
  const typeKey = currentTypeKey();
  const selected = houseTypes[typeKey];
  const mount   = document.getElementById("configFormMount");
  const image   = document.getElementById("selectedImage");
  const template = document.getElementById(`form-template-${typeKey}`);

  setText("selectedPill",        selected.pill);
  setText("selectedTitle",       selected.title);
  setText("selectedDescription", selected.description);

  if (image) {
    image.src = selected.image;
    image.alt = `${selected.title} preview`;
  }

  if (!template || !mount) {
    console.error(`Missing template for house type: ${typeKey}`);
    return;
  }

  // Clone the native HTML template and inject it into the page
  const content = template.content.cloneNode(true);
  mount.appendChild(content);

  // The form element is what we just appended
  const form = mount.querySelector("form");

  injectAdvancedModeToggle(form);
  
  wireToggleSwitches(form);
  wireConditionalFields(form);
  wireFloorAreaDisplay(form);
  wireBudgetInput(form);
  wireCustomPaintInput(form);
  wireRoomConstraints(form);
  wireFormSubmit(form);
}

function wireRoomConstraints(form) {
  function enforceConstraints() {
    ['1F', '2F'].forEach(floor => {
      const bedSelect = form.querySelector(`select[name="bedrooms${floor}"]`);
      const crSelect = form.querySelector(`select[name="crs${floor}"]`);
      if (!bedSelect || !crSelect) return;

      const beds = parseInt(bedSelect.value) || 0;
      // Max CRs = 1 (Common) + 1 En-suite per Bedroom
      const maxCRs = beds + 1;
      
      let currentCrVal = parseInt(crSelect.value) || 0;
      if (currentCrVal > maxCRs) {
        crSelect.value = maxCRs;
        alert(`Reduced ${floor} Comfort Rooms to ${maxCRs} because there are only ${beds} bedroom(s). Max CRs allowed is 1 Common + 1 per Bedroom.`);
      }

      // Disable options that are > maxCRs
      Array.from(crSelect.options).forEach(opt => {
        const val = parseInt(opt.value) || 0;
        opt.disabled = val > maxCRs;
      });
    });
  }

  form.addEventListener('change', (e) => {
    const target = e.target;
    if (target.tagName === 'SELECT' && (target.name.startsWith('bedrooms') || target.name.startsWith('crs'))) {
      enforceConstraints();
    }
  });

  // Run initially
  setTimeout(enforceConstraints, 0);
}

function injectAdvancedModeToggle(form) {
  // Identify sections
  const sections = form.querySelectorAll('.form-section');
  if (sections.length === 0) return;

  // Assume Section 1 (index 0) is Advanced Costing/Roof
  // Section 2 (index 1) is Dimensions
  // Section 3 (index 2) is Rooms
  // Section 4 (index 3) is Finishes
  sections.forEach((sec, index) => {
    // Hide all sections except Dimensions and Rooms by default
    if (index !== 1 && index !== 2) {
      sec.classList.add('advanced-setting');
      sec.style.display = 'none';
    }
  });

  // Inject toggle UI at the top of the form
  const intro = form.querySelector('.form-intro');
  if (intro) {
    const toggleHtml = `
      <div class="bw-mode-banner">
        <div class="bw-mode-banner-text">
          <strong>Basic Mode</strong>
          <span>Only Dimensions &amp; Rooms shown. The system optimizes the rest.</span>
        </div>
        <label class="bw-mode-switch">
          <input type="checkbox" id="advancedModeToggle">
          <span class="bw-mode-track"></span>
          <span class="bw-mode-label">Advanced Options</span>
        </label>
      </div>
    `;
    intro.insertAdjacentHTML('afterend', toggleHtml);

    const toggle = form.querySelector('#advancedModeToggle');
    const banner = form.querySelector('.bw-mode-banner');
    const bannerTitle = banner.querySelector('strong');
    toggle.addEventListener('change', (e) => {
      const isAdvanced = e.target.checked;
      form.querySelectorAll('.advanced-setting').forEach(sec => {
        sec.style.display = isAdvanced ? 'block' : 'none';
      });
      bannerTitle.textContent = isAdvanced ? 'Advanced Mode' : 'Basic Mode';
      banner.classList.toggle('bw-mode-banner--advanced', isAdvanced);
    });
  }
}

/* --- Toggle Switch Wiring ---------------------------------- */

/**
 * Syncs each hidden input + status label to its toggle checkbox.
 * Runs once on form mount.
 */
function wireToggleSwitches(form) {
  form.querySelectorAll(".bw-toggle-input").forEach((checkbox) => {
    const hidden = checkbox.closest(".bw-toggle").querySelector('input[type="hidden"]');
    const status = checkbox.closest(".bw-toggle").querySelector(".bw-toggle-status");
    if (!hidden) return;

    function sync() {
      hidden.value = checkbox.checked ? checkbox.dataset.on : checkbox.dataset.off;
      if (status) status.textContent = checkbox.checked ? "Yes" : "No";
    }

    checkbox.addEventListener("change", sync);
  });
}

/* --- Conditional Field UI Logic ---------------------------- */

function wireConditionalFields(form) {
  function updateVisibility() {
    const formData = new FormData(form);
    
    // Evaluate conditions based on hidden inputs
    const applyTilesGround = formData.get("applyTilesGround") === "Yes";
    const applyTilesSecond = formData.get("applyTilesSecond") === "Yes";
    const showTiles = applyTilesGround || applyTilesSecond;
    
    const groundFloorCeiling = formData.get("groundFloorCeiling") === "Yes";
    const mezzanineCeiling = formData.get("mezzanineCeiling") === "Yes";
    const showLoftCeiling = groundFloorCeiling || mezzanineCeiling;
    
    const ceilingGroundFloor = formData.get("ceilingGroundFloor") === "Yes";
    const ceilingSecondFloor = formData.get("ceilingSecondFloor") === "Yes";
    const showTwoStoreyCeiling = ceilingGroundFloor || ceilingSecondFloor;
    
    const hasCeiling = formData.get("hasCeiling") === "Yes";
    
    const includePainting = formData.get("includePainting") === "Yes";
    const paintGroundFloor = formData.get("paintGroundFloor") === "Yes";
    const paintSecondFloor = formData.get("paintSecondFloor") === "Yes";

    form.querySelectorAll('.conditional-field').forEach(field => {
       const condition = field.dataset.condition;
       let isVisible = false;
       
       if (condition === 'showTiles') isVisible = showTiles;
       else if (condition === 'showLoftCeiling') isVisible = showLoftCeiling;
       else if (condition === 'showTwoStoreyCeiling') isVisible = showTwoStoreyCeiling;
       else if (condition === 'hasCeiling') isVisible = hasCeiling;
       else if (condition === 'includePainting') isVisible = includePainting;
       else if (condition === 'paintGroundFloor') isVisible = paintGroundFloor;
       else if (condition === 'paintSecondFloor') isVisible = paintSecondFloor;
       else isVisible = true;
       
       field.style.display = isVisible ? '' : 'none';
       
       // Optionally disable hidden inputs so they don't break validation or submit incorrectly
       field.querySelectorAll('input, select').forEach(input => {
         // Keep disabled state in sync
         input.disabled = !isVisible;
       });
    });
  }

  // Trigger update when any toggle changes
  form.querySelectorAll(".bw-toggle-input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // Need a tick to let wireToggleSwitches sync the hidden input first
      setTimeout(updateVisibility, 0);
    });
  });
  
  // Initial run
  updateVisibility();
}

/* --- Budget Input Formatting ------------------------------- */

/**
 * Formats a numeric string with comma separators.
 * Strips all non-digit characters and leading zeroes before formatting.
 */
function formatBudgetValue(val) {
  let clean = val.replace(/[^\d]/g, "");
  // Strip leading zeroes unless the value is exactly "0"
  clean = clean.replace(/^0+(?=\d)/, "");
  if (!clean || clean === "0") return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Attaches live formatting to the budget input and preserves
 * cursor position after each keystroke.
 */
function wireBudgetInput(form) {
  const budgetInput = form.querySelector('[name="budgetInput"]');
  if (!budgetInput) return;

  // Format initial value on load
  budgetInput.value = formatBudgetValue(budgetInput.value);

  budgetInput.addEventListener("input", function () {
    this.setCustomValidity("");

    const originalValue      = this.value;
    const selectionStart     = this.selectionStart;
    const digitsBeforeCursor = originalValue
      .slice(0, selectionStart)
      .replace(/[^\d]/g, "").length;

    const formatted  = formatBudgetValue(originalValue.replace(/[^\d]/g, ""));
    this.value       = formatted;

    // Restore cursor at the same logical digit position
    let newPos = 0;
    let seen   = 0;
    while (newPos < formatted.length && seen < digitsBeforeCursor) {
      if (formatted[newPos] !== ",") seen++;
      newPos++;
    }
    this.setSelectionRange(newPos, newPos);
  });

  budgetInput.addEventListener("blur", function () {
    let val = this.value.replace(/[^\d]/g, "");
    this.value = formatBudgetValue(val);
  });
}

/* --- Custom Paint Color Theme ------------------------------ */

function wireCustomPaintInput(form) {
  const selects = form.querySelectorAll('select[name^="paintColorTheme"]');
  if (!selects.length) return;

  selects.forEach(select => {
    // 1. Colorize dropdown options to match the vibe
    Array.from(select.options).forEach(opt => {
      const text = opt.text;
      if (text.includes('Classic White')) {
        opt.style.backgroundColor = '#F8F6F0';
        opt.style.color = '#333';
      } else if (text.includes('Cream')) {
        opt.style.backgroundColor = '#E8DCC8';
        opt.style.color = '#333';
      } else if (text.includes('Cool Neutrals')) {
        opt.style.backgroundColor = '#D0D4D8';
        opt.style.color = '#333';
      } else if (text.includes('Modern Minimalist')) {
        opt.style.backgroundColor = '#F0F0F0';
        opt.style.color = '#111';
      }
    });

    // 2. Custom input logic
    if (select.dataset.customWired) return;
    select.dataset.customWired = "true";

    const container = document.createElement("div");
    container.className = "mt-2 custom-paint-container";
    container.hidden = true;
    
    const input = document.createElement("input");
    input.type = "text";
    input.name = select.name === "paintColorTheme" ? "customPaintColorTheme" : "custom" + select.name.charAt(0).toUpperCase() + select.name.slice(1);
    input.className = "form-control";
    input.placeholder = "Enter custom color";
    
    container.appendChild(input);
    select.parentNode.appendChild(container);

    select.addEventListener("change", () => {
      const isCustom = select.value.includes("Custom");
      container.hidden = !isCustom;
      if (isCustom) {
        input.required = true;
        input.focus();
      } else {
        input.required = false;
        input.value = "";
      }
    });
  });
}

/* --- Floor Area Display ------------------------------------ */

function wireFloorAreaDisplay(form) {
  // Find primary inputs (all forms use length/width or groundLength/groundWidth)
  const l1Input = form.querySelector('[name="length"], [name="groundLength"]');
  const w1Input = form.querySelector('[name="width"], [name="groundWidth"]');
  
  // Find secondary inputs for Two-Storey or Loft
  const l2Input = form.querySelector('[name="secondFloorLength"], [name="mezzanineLength"]');
  const w2Input = form.querySelector('[name="secondFloorWidth"], [name="mezzanineWidth"]');

  if (!l1Input || !w1Input) return;

  const container = document.createElement("div");
  container.className = "col-12 mt-3";
  container.innerHTML = `
    <div class="alert alert-success d-flex align-items-center py-2 mb-0" style="background-color: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32;">
      <strong class="me-2">Estimated Total Floor Area:</strong>
      <span id="liveFloorAreaDisplay">0.00 sqm</span>
    </div>
  `;

  // Find the row containing the inputs to append our container safely
  const dimSection = l1Input.closest(".row");
  if (dimSection) {
    dimSection.appendChild(container);
  }

  function updateArea() {
    let total = 0;
    const l1 = parseFloat(l1Input.value) || 0;
    const w1 = parseFloat(w1Input.value) || 0;
    total += (l1 * w1);

    if (l2Input && w2Input) {
      const l2 = parseFloat(l2Input.value) || 0;
      const w2 = parseFloat(w2Input.value) || 0;
      total += (l2 * w2);
    }

    const display = container.querySelector("#liveFloorAreaDisplay");
    if (display) {
      display.textContent = total.toFixed(2) + " sqm";
    }
  }

  // Attach listeners
  l1Input.addEventListener("input", updateArea);
  w1Input.addEventListener("input", () => {
    if (w2Input && form.dataset.type === "loft") {
      w2Input.value = w1Input.value;
    }
    updateArea();
  });
  if (l2Input && w2Input) {
    l2Input.addEventListener("input", updateArea);
    w2Input.addEventListener("input", updateArea);
  }

  // Initial calculation
  updateArea();
}

/* --- Form Submit Handler ----------------------------------- */

function getUserInput(form) {
  const submittedTypeKey = form.dataset.type;
  const submittedType    = houseTypes[submittedTypeKey];
  const formData         = new FormData(form);

  const data = {
    typeKey:     submittedTypeKey,
    title:       submittedType.title,
  };

  let totalArea = 0;
  let totalRooms = 0;
  let totalBaths = 0;

  // Dynamically parse all form inputs
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

    // Convert "Yes"/"No" toggles to pure booleans
    if (cleanVal.startsWith("Yes")) {
      data[key] = true;
      continue;
    }
    if (cleanVal.startsWith("No")) {
      data[key] = false;
      continue;
    }

    // Convert string numbers to real numbers
    if (cleanVal !== "" && !isNaN(cleanVal)) {
      const num = parseFloat(cleanVal);
      data[key] = num;
      
      // Keep track of totals for the UI
      if (key.toLowerCase().includes("bedrooms")) totalRooms += num;
      if (key.toLowerCase().includes("crs")) totalBaths += num;
      
      continue;
    }

    // Clean Tile Size (extract only the dimension, e.g., "30x30")
    if (key === "tileSize" && cleanVal.includes(" - ")) {
      data[key] = cleanVal.split(" ")[0];
      continue;
    }

    // Clean Percentages (e.g., "10%" -> 10)
    if (cleanVal.endsWith("%")) {
      data[key] = parseFloat(cleanVal.replace("%", ""));
      continue;
    }

    // Clean Roof Type mapping to numbers for the backend
    if (key === "roofType") {
      const roofTypes = [
        "", // 1-indexed
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
        data[key] = idx;
        data.roofStyle = cleanVal; // Keep string version for UI
        continue;
      }
    }

    // Assign generic strings
    data[key] = cleanVal;
  }

  // Calculate the Lot Area and Total Floor Area dynamically based on gathered inputs
  const l1 = data.length || data.groundLength || 0;
  const w1 = data.width || data.groundWidth || 0;
  const l2 = data.secondFloorLength || data.mezzanineLength || 0;
  const w2 = data.secondFloorWidth || data.mezzanineWidth || 0;
  
  // Validation Rules (Part 10 of Execution Plan)
  if (l1 > 0 && l1 < 1) { alert("Dimension must be at least 1 meter."); return null; }
  if (w1 > 0 && w1 < 1) { alert("Dimension must be at least 1 meter."); return null; }
  if (l2 > 0 && l2 < 1) { alert("Dimension must be at least 1 meter."); return null; }
  if (w2 > 0 && w2 < 1) { alert("Dimension must be at least 1 meter."); return null; }
  
  if (data.groundWallHeight && data.groundWallHeight < 2) {
    alert("Wall height must be at least 2 meters.");
    return null;
  }
  if (data.secondFloorWallHeight && data.secondFloorWallHeight < 2) {
    alert("Wall height must be at least 2 meters.");
    return null;
  }
  
  const gfArea = l1 * w1;
  const mezzArea = l2 * w2;
  if (submittedTypeKey === "loft" && mezzArea > (0.5 * gfArea)) {
    alert("Mezzanine floor cannot exceed 50% of the ground floor area per building code.");
    return null;
  }

  data.lotArea = Math.round(l1 * w1);
  data.floorArea = Math.round((l1 * w1) + (l2 * w2));
  
  // Set UI presentation metadata required by result.js
  data.bedrooms = totalRooms;
  data.bathrooms = totalBaths;
  data.familySize = totalRooms <= 2 ? "Small family" : totalRooms <= 4 ? "Growing family" : "Multi-generation family";
  data.timeline = "Within 6 months";
  data.kitchenStyle = "Standard kitchen";
  data.finishLevel = data.materialGrade || "Standard";
  data.mainMaterial = data.chbType || data.wallingMaterialType || submittedType.material[0];
  data.layoutPriority = "Engineer formula inputs";

  return data;
}

/**
 * Collects all form values, computes derived fields,
 * saves the result object to localStorage, then navigates
 * to the result page.
 */
function wireFormSubmit(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = getUserInput(form);
    if (!data) return;

    // Temporary debug mode:
    console.log("Extracted Form Data:", data);
    // alert(JSON.stringify(data, null, 2));

    localStorage.setItem("buildwiseResult", JSON.stringify(data));
    window.location.href = `result.html?type=${encodeURIComponent(data.typeKey)}`;
  });
}

/* --- Boot -------------------------------------------------- */
// Only runs on configure.html — where #configFormMount exists.
if (document.getElementById("configFormMount")) {
  setupConfigPage();
}

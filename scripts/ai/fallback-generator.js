/**
 * Deterministic Rule-Based Fallback Generator.
 * Used as a safety net when cloud API providers are unavailable or timeout.
 * Employs Philippine National Building Code (PD 1096) zoning and realistic cost-per-sqm metrics.
 */
export function generateSmartFallback(form, typeKey, setupData) {
  console.warn("⚠️ Using Deterministic Rule-Based Fallback with Smart Spatial Scaling.");

  const suggestions = [];
  const budget = Number(setupData.budget) || 800000;
  const lotArea = Number(setupData.area) || 60;
  const location = String(setupData.location || "");
  const landType = String(setupData.landType || "Flat");

  // 1. Calculate smart building footprint (~65% to 75% coverage for setbacks/ventilation)
  let coverageRatio = lotArea <= 40 ? 0.75 : lotArea <= 80 ? 0.70 : 0.65;
  let targetFootprint = lotArea * coverageRatio;

  // Budget reality check: Standard Philippine construction is ~15,000 - 22,000 PHP/sqm
  if (budget > 0) {
    const maxAffordableArea = budget / 14000;
    if (targetFootprint > maxAffordableArea) {
      targetFootprint = Math.max(25, Math.round(maxAffordableArea * 10) / 10);
    }
  }

  // Calculate Length & Width with pleasant 1:1.25 residential ratio
  const length = Math.round(Math.sqrt(targetFootprint * 1.25) * 2) / 2;
  const width = Math.round((targetFootprint / length) * 2) / 2;
  const groundArea = length * width;

  // Floor area calculations based on house type
  const isTwoStorey = typeKey === "two-storey";
  const isLoft = typeKey === "loft";

  const mezzanineLength = isLoft ? Math.round(length * 0.5 * 2) / 2 : 0;
  const mezzanineWidth = width;
  const mezzanineArea = mezzanineLength * mezzanineWidth;

  const totalFloorArea = isTwoStorey ? groundArea * 2 : isLoft ? groundArea + mezzanineArea : groundArea;

  // 2. Intelligent Room Program (Bedrooms & CRs) based on Floor Area
  let suggestedBed1 = 1;
  let suggestedCr1 = Math.max(1, 1);
  let suggestedBed2 = 0;
  let suggestedCr2 = 0;

  if (isTwoStorey) {
    suggestedCr1 = 1;
    if (totalFloorArea <= 80) {
      suggestedBed1 = 0; // Ground floor dedicated to living/dining/kitchen
      suggestedBed2 = 2; // 2 upstairs bedrooms
      suggestedCr2 = 1;
    } else if (totalFloorArea <= 130) {
      suggestedBed1 = 1; // 1 guest/senior bedroom on ground floor
      suggestedBed2 = 3; // 3 bedrooms upstairs (1 Master + 2)
      suggestedCr2 = 2; // 1 en-suite + 1 common upstairs
    } else {
      suggestedBed1 = 1;
      suggestedBed2 = 4;
      suggestedCr2 = 2;
    }
  } else if (isLoft) {
    suggestedBed1 = 1; // 1 bedroom on ground floor
    suggestedCr1 = 1;  // 1 common CR on ground floor
    suggestedBed2 = 1; // 1 Master Loft Suite (clean, open layout)
    suggestedCr2 = mezzanineArea >= 28 ? 1 : 0;
  } else {
    // 1-Storey houses (CHB, Half-Amakan, Half-Metal)
    if (totalFloorArea <= 36) {
      suggestedBed1 = 1;
      suggestedCr1 = 1;
    } else if (totalFloorArea <= 60) {
      suggestedBed1 = 2;
      suggestedCr1 = 1;
    } else if (totalFloorArea <= 95) {
      suggestedBed1 = 3;
      suggestedCr1 = 2;
    } else if (totalFloorArea <= 135) {
      suggestedBed1 = 4;
      suggestedCr1 = 2;
    } else {
      suggestedBed1 = 5;
      suggestedCr1 = 3;
    }
  }

  // Helper to pick exact matching or closest valid option
  function pickOption(select, targetVal) {
    const opts = Array.from(select.querySelectorAll("option")).map((o) => o.value || o.text);
    if (opts.includes(String(targetVal))) return String(targetVal);
    const num = Number(targetVal);
    if (!isNaN(num)) {
      let best = opts[0];
      let minDiff = Infinity;
      for (const o of opts) {
        const valNum = Number(o);
        if (!isNaN(valNum) && Math.abs(valNum - num) < minDiff) {
          minDiff = Math.abs(valNum - num);
          best = o;
        }
      }
      return best;
    }
    return opts[0];
  }

  // 3. Process Select Inputs
  form.querySelectorAll("select[name]").forEach((select) => {
    const name = select.name;
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value || o.text);
    let value = options[0];
    let reason = "";

    if (name === "bedrooms1F") {
      value = pickOption(select, suggestedBed1);
      reason = `Selected ${value} bedroom(s) on ground floor for optimal zoning on ${groundArea.toFixed(1)} sqm footprint.`;
    } else if (name === "bedrooms2F") {
      value = pickOption(select, suggestedBed2);
      reason = `Allocated ${value} bedroom(s) on upper level for private family sleeping quarters.`;
    } else if (name === "crs1F") {
      value = pickOption(select, suggestedCr1);
      reason = `Assigned ${value} comfort room(s) on ground level for household and guest convenience.`;
    } else if (name === "crs2F") {
      value = pickOption(select, suggestedCr2);
      reason = `Allocated ${value} comfort room(s) on upper floor for ensuite and night access.`;
    } else if (name.includes("materialGrade")) {
      const budgetPerSqm = budget / (totalFloorArea || 30);
      if (budgetPerSqm >= 20000 || budget > 900000) {
        value = options.find(o => o.toLowerCase().includes("premium")) || options.find(o => o.toLowerCase().includes("mid")) || options[options.length - 1];
      } else if (budgetPerSqm < 12000 && budget <= 280000) {
        value = options.find(o => o.toLowerCase().includes("basic")) || options[0];
      } else {
        value = options.find(o => o.toLowerCase().includes("standard") || o.toLowerCase().includes("mid")) || options[0];
      }
      reason = `Selected ${value} grade to balance architectural quality with the ₱${budget.toLocaleString()} budget.`;
    } else if (name.includes("soilCondition")) {
      if (landType.toLowerCase().includes("rock")) {
        value = options.find((o) => o.toLowerCase().includes("rock") || o.toLowerCase().includes("firm")) || options[0];
      } else if (landType.toLowerCase().includes("slop")) {
        value = options.find((o) => o.toLowerCase().includes("firm")) || options[0];
      } else {
        value = options.find((o) => o.toLowerCase().includes("standard") || o.toLowerCase().includes("medium")) || options[0];
      }
      reason = `Configured foundation specs suitable for ${landType} ground conditions.`;
    } else if (name.includes("roofType") || name.includes("roofStyle")) {
      const budgetPerSqm = budget / (totalFloorArea || 30);
      if (location.toLowerCase().includes("typhoon")) {
        value = options.find((o) => o.toLowerCase().includes("long span") || o.toLowerCase().includes("pre-painted")) || options[0];
        reason = `Selected high-tensile pre-painted roofing for enhanced wind resistance in typhoon-prone zones.`;
      } else if (budgetPerSqm >= 22000 || budget >= 1200000) {
        value = options.find((o) => o.toLowerCase().includes("tile roof") || o.toLowerCase().includes("deck")) || options.find((o) => o.toLowerCase().includes("long span")) || options[0];
        reason = `Selected premium architectural roofing with superior insulation and longevity.`;
      } else if (budgetPerSqm >= 12000 || budget >= 450000) {
        value = options.find((o) => o.toLowerCase().includes("long span") || o.toLowerCase().includes("color roof")) || options[0];
        reason = `Selected durable pre-painted corrugated roofing for cost-effective weather resistance.`;
      } else {
        value = options[0];
        reason = `Selected reliable corrugated GI roofing profile matched to budget.`;
      }
    } else if (name.includes("tileSize")) {
      const budgetPerSqm = budget / (totalFloorArea || 30);
      if (budgetPerSqm >= 22000 || budget >= 1200000) {
        value = options.find((o) => o.includes("60x60") || o.includes("50x50")) || options[options.length - 1];
      } else if (budgetPerSqm >= 13000 || budget >= 500000) {
        value = options.find((o) => o.includes("40x40") || o.includes("30x60")) || options.find((o) => o.includes("30x30")) || options[0];
      } else {
        value = options.find((o) => o.includes("30x30")) || options[0];
      }
      reason = `Standardized ${value.split(" ")[0]} tile dimensions to optimize installation labor and minimize tile cuts.`;
    } else if (name.toLowerCase().includes("paintcolor") || name.toLowerCase().includes("painttheme")) {
      const palleteOptions = [
        "Cream / Warm Beige",
        "Earth Tones - Terracotta Clay Sandy Brown",
        "Cool Neutrals - Light Grey Blue-Grey",
        "Modern Minimalist - Pure White + one dark accent",
        "Classic White & Off-White"
      ];
      // Pick dynamic color theme based on seed/budget
      const pick = budget > 800000 ? palleteOptions[1] : budget > 400000 ? palleteOptions[0] : palleteOptions[3];
      value = options.find((o) => o.includes(pick)) || options[0];
      reason = `Selected architectural color palette to give the home distinctive aesthetic character.`;
    } else {
      value = options[0];
      reason = `Applied standard engineering configuration.`;
    }

    suggestions.push({ name, value, reason });
  });

  // 4. Process Number Inputs
  form.querySelectorAll('input[type="number"][name]').forEach((input) => {
    const name = input.name;
    let value = Number(input.value) || Number(input.min) || 1;
    let reason = "";

    if (name === "length" || name === "groundLength") {
      value = length;
      reason = `Optimized building length (${value}m) maintaining statutory front/rear setbacks on a ${lotArea} sqm lot.`;
    } else if (name === "width" || name === "groundWidth") {
      value = width;
      reason = `Optimized building width (${value}m) providing adequate side yard easements and daylight clearance.`;
    } else if (name === "secondFloorLength") {
      value = length;
      reason = `Full structural alignment with ground floor perimeter walls.`;
    } else if (name === "secondFloorWidth") {
      value = width;
      reason = `Aligned 2nd floor footprint for direct vertical column load transfers.`;
    } else if (name === "mezzanineLength") {
      value = mezzanineLength;
      reason = `Mezzanine length within code-compliant 50% building footprint limit.`;
    } else if (name === "mezzanineWidth") {
      value = mezzanineWidth;
      reason = `Span matching structural framing for cost-effective joist distribution.`;
    } else if (name === "chbBaseWallHeight") {
      value = 0.9;
      reason = `Standard 0.9m CHB base wall height for sturdy lower walling and splash protection.`;
    } else if (name.toLowerCase().includes("height")) {
      value = Number(input.value) || 2.7;
      reason = `Standard 2.7m ceiling clearance to promote passive cross-ventilation.`;
    } else {
      value = Number(input.value) || Number(input.min) || 1;
      reason = `Standard engineering parameter.`;
    }

    if (input.min !== "" && !isNaN(Number(input.min))) {
      value = Math.max(Number(input.min), value);
    }
    if (input.max !== "" && !isNaN(Number(input.max))) {
      value = Math.min(Number(input.max), value);
    }

    suggestions.push({ name, value, reason });
  });

  // 5. Process Toggles (Hidden inputs with checkbox peer)
  form.querySelectorAll('input[type="hidden"][name]').forEach((hidden) => {
    const toggle = hidden.parentElement.querySelector(".bw-toggle-input");
    if (toggle) {
      const name = hidden.name;
      let value = toggle.dataset.off;
      let reason = "";

      if (budget <= 250000) {
        // Tight budget: keep only essentials (electrical & plumbing)
        if (name.includes("Electrical") || name.includes("Plumbing")) {
          value = toggle.dataset.on;
          reason = `Retained essential utility line installation.`;
        } else {
          value = toggle.dataset.off;
          reason = `Deferred optional finishing to preserve core structural budget.`;
        }
      } else if (budget > 900000) {
        // High budget: enable full finishes
        value = toggle.dataset.on;
        reason = `Enabled premium finish package for comfort and aesthetic appeal.`;
      } else {
        // Mid-range: enable paint, plastering, ceiling; exclude AC wiring circuit
        if (name.toLowerCase().includes("acwiring")) {
          value = toggle.dataset.off;
          reason = `Excluded dedicated AC circuit to reserve funds for architectural finishes.`;
        } else {
          value = toggle.dataset.on;
          reason = `Included standard architectural finishes to ensure complete livability.`;
        }
      }

      suggestions.push({ name, value, reason });
    }
  });

  return suggestions;
}

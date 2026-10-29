import { getRegionalFactors } from "./regional.js";
import { formatMaterialCost } from "./prices.js";
import { getLaborRates, getLaborMultiplier } from "./labor.js";
import { getEffectiveTools, getToolsCost } from "./tools.js";

import * as chbConfig from "./configs/chb.config.js";
import * as amakanConfig from "./configs/half-amakan.config.js";
import * as metalConfig from "./configs/half-metal.config.js";
import * as loftConfig from "./configs/loft.config.js";
import * as twoStoreyConfig from "./configs/two-storey.config.js";

const configs = {
  "chb": chbConfig,
  "half-amakan": amakanConfig,
  "half-metal": metalConfig,
  "loft": loftConfig,
  "two-storey": twoStoreyConfig
};

function generateTimelineAndLabor(laborCost, floorArea, materialsList = [], regionalLaborMult = 1.0) {
  const laborRates = getLaborRates();
  // Compute average wage from custom settings
  const avgWage = Math.round(((laborRates["Lead Carpenter / Master Builder"] + laborRates["Helper / Ordinary Laborer"]) / 2) * regionalLaborMult);
  
  // Base crew size determined by floor area
  let baseCrew = 3;
  if (floorArea >= 30 && floorArea < 60) baseCrew = 4;
  else if (floorArea >= 60 && floorArea < 100) baseCrew = 5;
  else if (floorArea >= 100) baseCrew = 6;
  
  // Calculate total working days using crew-weighted daily burn rate
  // Cap at 90 working days — residential homes rarely exceed 3-4 months active work
  const dailyBurnRate = baseCrew * avgWage;
  const totalWorkingDays = Math.min(90, Math.ceil(laborCost / dailyBurnRate));
  
  // Determine included features from materials list
  const hasFinishesPhase = materialsList.some(c => c.category === "Finishes");
  const hasPlumbing = materialsList.some(c => c.category === "Plumbing");
  const hasElectrical = materialsList.some(c => c.category === "Electrical");
  const hasUtilitiesPhase = hasPlumbing || hasElectrical;

  let activePhases = [];
  
  activePhases.push({ name: "Phase 1: Foundation & Masonry",        rawPct: 0.20, crew: baseCrew + 1, delay: 7,  delayNote: "curing & inspection" });
  activePhases.push({ name: "Phase 2: Structural Framing & Walling",rawPct: 0.35, crew: baseCrew + 1, delay: 10, delayNote: "slab curing & inspection" });
  
  const hasCeiling = materialsList.some(c => c.category === "Finishes" && c.items.some(i => i.name.toLowerCase().includes("ceiling") || i.name.toLowerCase().includes("board")));
  const p3Name = hasCeiling ? "Phase 3: Roofing & Ceiling" : "Phase 3: Roofing";
  activePhases.push({ name: p3Name, rawPct: 0.15, crew: Math.max(3, baseCrew - 1), delay: 3,  delayNote: "inspection" });

  if (hasFinishesPhase) {
     const hasTiles = materialsList.some(c => c.category === "Finishes" && c.items.some(i => i.name.toLowerCase().includes("tile")));
     let p4Name = "Phase 4: Finishes";
     if (hasTiles) p4Name += " & Tiling";
     activePhases.push({ name: p4Name, rawPct: 0.20, crew: Math.max(2, baseCrew - 1), delay: 5, delayNote: "drying & inspection" });
  }
  
  if (hasUtilitiesPhase) {
     let utils = [];
     if (hasPlumbing) utils.push("Plumbing");
     if (hasElectrical) utils.push("Elec.");
     activePhases.push({ name: `Phase 5: ${utils.join(", ")} & Turnover`, rawPct: 0.10, crew: Math.max(2, baseCrew - 2), delay: 3, delayNote: "final inspection" });
  } else {
     activePhases[activePhases.length - 1].name += " & Turnover";
     activePhases[activePhases.length - 1].delay += 2;
     activePhases[activePhases.length - 1].delayNote += " & final inspection";
  }

  // Normalize percentages so they always sum to 100% of the calculated totalWorkingDays
  const totalRawPct = activePhases.reduce((sum, p) => sum + p.rawPct, 0);
  
  let totalBuildDays = 0;
  const phases = activePhases.map((p, index) => {
    // Rename Phase numbers sequentially (1, 2, 3, 4...) in case 4 was skipped and 5 remained
    const nameParts = p.name.split(": ");
    let finalName = p.name;
    if (nameParts.length > 1) {
       finalName = `Phase ${index + 1}: ${nameParts[1]}`;
    }
    
    const normalizedPct = p.rawPct / totalRawPct;
    const activeDays = Math.max(1, Math.ceil(totalWorkingDays * normalizedPct));
    const totalDays = activeDays + (p.delay || 0);
    
    totalBuildDays += totalDays;
    
    const displayName = p.delay ? `${finalName} (incl. ${p.delay}d ${p.delayNote})` : finalName;
    
    return { name: displayName, days: totalDays, workers: p.crew };
  });

  return { 
    stats: { workers: `${Math.max(2, baseCrew - 2)}-${baseCrew + 1}`, buildDays: totalBuildDays, workingDays: totalWorkingDays }, 
    phases: phases 
  };
}

const KEY_MAP = {
  cement: "Cement (Mortar 40kg)",
  screenedSand: "Screened Sand",
  fineSand: "Fine Sand",
  gravel: "3/4 Gravel",
  rebar16mm: "16mm Deformed Bar (6m)",
  rebar12mm: "12mm Deformed Bar (6m)",
  rebar10mm: "10mm Deformed Bar (6m)",
  chb: "CHB 4-inch",
  amakanSheets: "Amakan Sheet (4x8 ft)",
  metalCladdingSheets: "Metal Cladding Sheet",
  cocoLumber: "Coco Lumber",
  rectTube: "Rectangular Steel Tube 2x3x1.5mm (6m)",
  cPurlins: "C-Purlin 100x50x15x2mm (6m)",
  ridgeCaps: "Ridge Roll / Ridge Cap",
  wallAngles: "Wall Angle (3m)",
  channels: "Main Channel / Carrying Channel (3m)",
  furring: "Furring (3m)",
  mortarCement: "Cement (Mortar 40kg)",
  whiteCement: "White Cement (Tile Grout)",
  tileAdhesive: "Tile Adhesive (25kg bag)",
  primer: "Concrete Primer",
  topcoat: "Architectural Topcoat Paint", // handled dynamically below
  plasterCement: "Cement (Plastering 40kg)",
  handrail: "Handrail",
  newelPost: "Newel Post",
  phenolicBoard: "Phenolic Board 3/4\"",
  stairCocoLumber: "Coco Lumber",
  stairAdhesive: "Tile Adhesive (25kg bag)",
  stairGrout: "White Cement (Tile Grout)",
  stairTiles: "Floor Tile - Large (30-60 / 60x60)",
  concretePutty: "Concrete Putty",
  paintAccessories: "Paint Brush / Roller set",
  paintThinner: "Paint Thinner",
  sandpaper: "Sandpaper / Masking Tape",
  roofingScrews: "Roofing Screw",
  siliconeSealant: "Silicone Sealant"
};

// Also map exact returned keys to add brands
const BRAND_MAP = {
  "Cement (Mortar 40kg)": " (Holcim/Republic)",
  "Cement (Plastering 40kg)": " (Holcim/Republic)",
  "Concrete Primer": " (Boysen/Davies)",
  "Architectural Topcoat Paint": " (Boysen/Davies)",
  "PVC Orange Pipes 4\" (Sanitary)": " (Neltex/Emerald)",
  "PVC Orange Pipes 2\" (Drainage)": " (Neltex/Emerald)",
  "PPR Pipes 1/2\" (Water Supply)": " (Neltex/Emerald)",
  "Water Closet (Standard flush)": " (HCG/American Standard)",
  "Lavatory (Wall-hung/Pedestal)": " (HCG/American Standard)",
  "PVC Electrical Conduit 1/2\"": " (Neltex/Emerald)",
  "Flexible Hose 1/2\" (50m)": " (Neltex/Emerald)",
  "THHN Wire 2.0mm² (Lighting)": " (Phelps Dodge/Philflex/Royu)",
  "THHN Wire 3.5mm² (Outlets)": " (Phelps Dodge/Philflex/Royu)",
  "THHN Wire 5.5mm² (AC/Heater)": " (Phelps Dodge/Philflex/Royu)",
  "Switches (1-3 gang)": " (Royu/Omni/Panasonic)",
  "Outlets (2-gang CO)": " (Royu/Omni/Panasonic)",
  "Panel Board & Circuit Breakers": " (Royu/GE)",
  "Floor Tile - Small (7.5-15cm)": " (Mariwasa/Eurotiles)",
  "Floor Tile - Medium (20-30cm)": " (Mariwasa/Eurotiles)",
  "Floor Tile - Large (30-60 / 60x60)": " (Mariwasa/Eurotiles)",
  "Fiber Cement Board (ceiling)": " (Hardiflex/James Hardie)",
  "Corrugated GI Sheet / Yero": " (ColorSteel/Union Galvasteel)",
  "Long Span Pre-Painted": " (ColorSteel/Union Galvasteel)",
  "Color Roof Corrugated": " (ColorSteel/Union Galvasteel)",
  "Metal Stone-Coated Tile": " (ColorSteel/Union Galvasteel)"
};

function getRoofName(rt) {
  const s = String(rt || "").toLowerCase();
  if (s.includes("color") || s === "3") return "Color Roof Corrugated";
  if (s.includes("corrugated") || s === "1") return "Corrugated GI Sheet / Yero";
  if (s.includes("long") || s === "2") return "Long Span Pre-Painted";
  if (s.includes("spandrel") || s === "4") return "Spandrel Panel (PVC)";
  if (s.includes("poly") || s === "5") return "Polycarbonate Sheet";
  if (s.includes("stone") || s === "7") return "Metal Stone-Coated Tile";
  return "Long Span Pre-Painted";
}

function getTileName(ts) {
  if (!ts) return "Floor Tile - Large (30-60 / 60x60)";
  const parts = ts.split("x").map(Number);
  const max = Math.max(parts[0] || 60, parts[1] || 60);
  if (max < 20) return "Floor Tile - Small (7.5-15cm)";
  if (max <= 30) return "Floor Tile - Medium (20-30cm)";
  return "Floor Tile - Large (30-60 / 60x60)";
}

function getBoardName(bt) {
  if (bt === "Fiber Cement") return "Fiber Cement Board (ceiling)";
  if (bt === "PVC") return "PVC Board (ceiling)";
  return "Ceiling Board 3x6 Gypsum";
}

function getCategory(key) {
  if (["cement", "screenedSand", "fineSand", "gravel", "rebar16mm", "rebar12mm", "rebar10mm", "tieWire", "Excavation / Backfill", "Soil Poisoning / Termite Treatment", "Formworks (Plywood & Lumber)", "Tie Wire #16"].includes(key)) return "Foundation & Structure";
  if (["chb", "amakanSheets", "metalCladdingSheets", "cocoLumber", "rectTube"].includes(key)) return "Walling";
  if (["cPurlins", "ridgeCaps", "roofSheets", "roofLM", "roofingScrews", "siliconeSealant"].includes(key)) return "Roofing";
  if (["handrail", "newelPost", "phenolicBoard", "stairCocoLumber", "stairTiles", "stairAdhesive", "stairGrout"].includes(key)) return "Stairs";
  if (["Main Door (Solid Wood Slab)", "Bedroom Door (Flush/Panel)", "CR Door (PVC/Aluminum)", "Door Jamb (Wood/Metal)", "Lockset / Doorknob", "Door Hinges (pair)", "Window Frame (Aluminum)", "Window Glass Panel (sqm)", "Window (Jalousie/Louvre)"].includes(key)) return "Doors & Windows";
  if (["PVC Orange Pipes 4\" (Sanitary)", "PVC Orange Pipes 2\" (Drainage)", "PPR Pipes 1/2\" (Water Supply)", "Sanitary Fittings (Orange)", "Water Supply Fittings (PPR)", "PVC Solvent / Teflon Tape", "Water Closet (Standard flush)", "Lavatory (Wall-hung/Pedestal)", "Kitchen Sink (Stainless)", "Shower Set (Head & Valve)", "Faucets & Angle Valves", "Floor Drain (4x4 Stainless)", "Septic Tank Components (CHB/Cement)"].includes(key)) return "Plumbing";
  if (["PVC Electrical Conduit 1/2\"", "Flexible Hose 1/2\" (50m)", "PVC Fittings & Boxes", "THHN Wire 2.0mm² (Lighting)", "THHN Wire 3.5mm² (Outlets)", "THHN Wire 5.5mm² (AC/Heater)", "Switches (1-3 gang)", "Outlets (2-gang CO)", "Lighting (LED/Pinlights)", "Panel Board & Circuit Breakers", "Electrical Tape"].includes(key)) return "Electrical";
  return "Finishes"; // Default for tiles, paint, ceiling
}


const PRIORITY_GROUPS = {
  core: ["Foundation & Structure", "Walling", "Roofing", "Stairs", "Doors & Windows"],
  utilities: ["Electrical", "Plumbing"],
  finishes: ["Finishes"]
};

function budgetFitEngine(materialsList, budget, totalLabor, contingency, typeKey) {
  if (!budget || budget <= 0) return { status: 'NO_BUDGET' };
  
  let coreCost = 0, utilCost = 0, finCost = 0;
  materialsList.forEach(cat => {
    if (PRIORITY_GROUPS.utilities.includes(cat.category)) utilCost += cat.total;
    else if (PRIORITY_GROUPS.finishes.includes(cat.category)) finCost += cat.total;
    else coreCost += cat.total;
  });

  const materialTotal = coreCost + utilCost + finCost;
  const multiplier = (materialTotal + totalLabor + contingency) / (materialTotal || 1);
  const totalCost = materialTotal * multiplier;
  
  if (totalCost > budget * 1.15) {
    return { status: 'UNDERFUNDED', floorCost: totalCost };
  }
  
  return { 
    status: 'FITTED', 
    coreGrade: 'Standard', 
    utilitiesGrade: 'Basic', 
    finishesGrade: 'Basic', 
    floorCost: totalCost, 
    upgradePath: ['Core → Standard'], 
    utilityFlags: [] 
  };
}

export function generateEstimate(data) {
  const typeKey = data.typeKey || "loft";
  const config = configs[typeKey] || configs["loft"];
  const grade = data.materialGrade || data.finishLevel || "Standard";
  const regionalFactors = getRegionalFactors(data.location);
  const regionalMatMult = regionalFactors.materialMultiplier || 1.0;
  const regionalLaborMult = regionalFactors.laborMultiplier || 1.0;
  
  const rawQuantities = config.estimate(data);

  if (typeof rawQuantities === "string") {
    return { error: rawQuantities };
  }

  // ── Helper: build formatted categories from a quantities map ──────────────
  function buildCategories(quantities) {
    let formattedCategories = [];
    let totalMaterialsCost = 0;

    const catMap = {
      "Foundation & Structure": [],
      "Walling": [],
      "Roofing": [],
      "Stairs": [],
      "Doors & Windows": [],
      "Finishes": [],
      "Plumbing": [],
      "Electrical": []
    };

    for (const [key, qty] of Object.entries(quantities)) {
      if (!qty || qty <= 0) continue;

      let priceName = KEY_MAP[key] || key;
      if (key === "roofSheets" || key === "roofLM") priceName = getRoofName(data.roofType);
      if (key === "tiles") priceName = getTileName(data.tileSize);
      if (key === "boards") priceName = getBoardName(data.boardType);
      let theme = "";
      if (key === "topcoat") {
        theme = data.paintColorTheme || data.paintColorThemeGround || data.paintColorThemeSecond || "Classic White & Off-White";
        priceName = `Architectural Topcoat Paint (${theme.split(" - ")[0]})`;
      }
      if (key === "primer") {
        priceName = `Concrete Primer`;
      }

      if (!priceName) {
        console.warn(`No price mapping for ${key}`);
        continue;
      }

      const priced = formatMaterialCost(priceName, Math.round(qty * 100) / 100, grade);
      
      // Apply regional local store pricing adjustment
      if (regionalMatMult !== 1.0) {
        priced.unitCost = Math.round(priced.unitCost * regionalMatMult * 100) / 100;
        priced.total = Math.round(priced.qty * priced.unitCost * 100) / 100;
      }
      
      // Apply color tint multiplier
      if (key === "topcoat" && theme) {
        let tintMult = 1.0;
        const t = theme.toLowerCase();
        if (t.includes("cream") || t.includes("cool") || t.includes("pastel")) tintMult = 1.15;
        if (t.includes("earth") || t.includes("tropical") || t.includes("minimalist")) tintMult = 1.30;
        
        priced.unitCost = priced.unitCost * tintMult;
        priced.total = priced.qty * priced.unitCost;
      }
      
      // Append specific brand: prioritize dynamic brand from tier catalog, fallback to BRAND_MAP
      let baseForBrand = priceName;
      if (priceName.startsWith("Architectural Topcoat Paint")) baseForBrand = "Architectural Topcoat Paint";
      if (priced.brand) {
        priced.name += ` (${priced.brand})`;
      } else if (BRAND_MAP[baseForBrand]) {
        priced.name += BRAND_MAP[baseForBrand];
      }

      catMap[getCategory(key)].push(priced);
    }

    for (const [catName, items] of Object.entries(catMap)) {
      if (items.length > 0) {
        const catTotal = items.reduce((acc, curr) => acc + curr.total, 0);
        formattedCategories.push({
          category: catName,
          items: items,
          total: catTotal
        });
        totalMaterialsCost += catTotal;
      }
    }

    return { formattedCategories, totalMaterialsCost };
  }

  // ── First-pass estimate ────────────────────────────────────────────────────
  let { formattedCategories, totalMaterialsCost } = buildCategories(rawQuantities);

  let laborMultiplier = getLaborMultiplier(typeKey);

  let contingencyMultiplier = 0.05;
  let laborEstimate = totalMaterialsCost * laborMultiplier;

  const floorArea = data.floorArea || (data.length * data.width) || 30;
  let forecasting = generateTimelineAndLabor(laborEstimate, floorArea, formattedCategories, regionalLaborMult);
  const totalWorkingDays = (forecasting.stats && forecasting.stats.workingDays) || 30;

  const hasPlumbingList = formattedCategories.some(c => c.category === "Plumbing");
  const hasElectricalList = formattedCategories.some(c => c.category === "Electrical");
  const finishesCat = formattedCategories.find(c => c.category === "Finishes");
  const hasTilesList = finishesCat && finishesCat.items.some(i => i.name.toLowerCase().includes("tile"));
  const hasPaintingList = finishesCat && finishesCat.items.some(i => i.name.toLowerCase().includes("paint") || i.name.toLowerCase().includes("primer") || i.name.toLowerCase().includes("putty"));

  const laborRates = getLaborRates();

  const hasMasonryWork = formattedCategories.some(c => c.category === "Foundation & Structure" || c.category === "Walling");

  const rawLaborRoles = [
    { 
      role: "Lead Carpenter / Master Builder", 
      wage: Math.round(laborRates["Lead Carpenter / Master Builder"] * regionalLaborMult), 
      workers: 1, 
      days: totalWorkingDays 
    }
  ];

  if (hasMasonryWork) {
    rawLaborRoles.push({ 
      role: "Mason", 
      wage: Math.round((laborRates["Mason"] || 550) * regionalLaborMult), 
      workers: floorArea >= 70 ? 2 : 1, 
      days: totalWorkingDays 
    });
  }

  const helperCount = Math.max(2, Math.min(4, Math.ceil(floorArea / 25)));
  rawLaborRoles.push({ 
    role: "Helper / Ordinary Laborer", 
    wage: Math.round(laborRates["Helper / Ordinary Laborer"] * regionalLaborMult), 
    workers: helperCount, 
    days: totalWorkingDays 
  });
  
  if (hasElectricalList) {
    rawLaborRoles.push({ 
      role: "Electrician", 
      wage: Math.round(laborRates["Electrician"] * regionalLaborMult), 
      workers: 1, 
      days: Math.max(3, Math.round(totalWorkingDays * 0.25)) 
    });
  }
  if (hasPlumbingList) {
    rawLaborRoles.push({ 
      role: "Plumber", 
      wage: Math.round(laborRates["Plumber"] * regionalLaborMult), 
      workers: 1, 
      days: Math.max(3, Math.round(totalWorkingDays * 0.25)) 
    });
  }
  if (hasTilesList) {
    rawLaborRoles.push({ 
      role: "Tile Setter", 
      wage: Math.round(laborRates["Tile Setter"] * regionalLaborMult), 
      workers: 1, 
      days: Math.max(4, Math.round(totalWorkingDays * 0.30)) 
    });
  }
  if (hasPaintingList) {
    rawLaborRoles.push({ 
      role: "Painter", 
      wage: Math.round(laborRates["Painter"] * regionalLaborMult), 
      workers: 1, 
      days: Math.max(4, Math.round(totalWorkingDays * 0.35)) 
    });
  }

  let laborBreakdown = rawLaborRoles.map(r => ({
    role: r.role,
    workers: r.workers,
    dailyWage: r.wage,
    days: r.days,
    total: r.workers * r.wage * r.days
  }));

  laborEstimate = laborBreakdown.reduce((sum, r) => sum + r.total, 0);

  // ── Tools & Equipment Integration ───────────────────────────────────────────
  let toolsData = null;
  if (data.includeTools) {
    const allTools = getEffectiveTools();
    const toolsCost = getToolsCost(allTools);
    const isWithPrice = data.toolsDisplayMode !== "list-only";

    toolsData = {
      tools: allTools,
      totalCost: isWithPrice ? toolsCost : 0,
      displayMode: isWithPrice ? "with-price" : "list-only"
    };
  }

  let subTotal = totalMaterialsCost + laborEstimate;
  let contingency = totalMaterialsCost * contingencyMultiplier;
  let grandTotal = subTotal + contingency + (toolsData ? toolsData.totalCost : 0);

  // ── Budget Reconciliation Pass ─────────────────────────────────────────────
  // (Removed maximum limit constraint as requested by the user)
  const budgetInput = Number(data.budget) || 0;
  let reconciliationNote = null;

  // ── Feasibility Status ─────────────────────────────────────────────────────
  let feasibility = { status: "", message: "" };

  if (budgetInput > 0) {
    if (grandTotal <= budgetInput * 0.95) {
      feasibility.status = "[OK] Within Budget";
      feasibility.message = "Your budget covers this design with some room to spare.";
    } else if (grandTotal <= budgetInput * 1.10) {
      feasibility.status = "[WARNING] Slightly Over Budget";
      feasibility.message = "This design exceeds your budget by less than 10%. Consider removing optional finishes.";
    } else {
      feasibility.status = "[OVER] Over Budget";
      feasibility.message = "This design exceeds your budget. Consider reducing house size or choosing Basic grade.";
    }
  }

  forecasting = generateTimelineAndLabor(laborEstimate, floorArea, formattedCategories, regionalLaborMult);

  return {
    materialsList: formattedCategories,
    summary: {
      totalMaterials: totalMaterialsCost,
      laborEstimate: laborEstimate,
      laborBreakdown: laborBreakdown,
      toolsData: toolsData,
      contingency: contingency,
      grandTotal: grandTotal,
      regionalAdjustment: {
        location: data.location || "Standard",
        label: regionalFactors.label,
        shortLabel: regionalFactors.shortLabel,
        laborMultiplier: regionalLaborMult,
        materialMultiplier: regionalMatMult,
        laborPercentLabel: (regionalLaborMult > 1 
          ? `+${Math.round((regionalLaborMult - 1) * 100)}%` 
          : regionalLaborMult < 1 
            ? `${Math.round((regionalLaborMult - 1) * 100)}%` 
            : "Base"),
        materialPercentLabel: (regionalMatMult > 1 
          ? `+${Math.round((regionalMatMult - 1) * 100)}%` 
          : "Base"),
        description: regionalFactors.description
      }
    },
    feasibility,
    forecasting,
    reconciliationNote,
  };
}


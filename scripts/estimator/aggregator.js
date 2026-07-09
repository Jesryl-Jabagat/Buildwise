import { formatMaterialCost } from "./prices.js";

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

function generateTimelineAndLabor(laborCost, floorArea) {
  const avgWage = 650;
  
  // Base crew size determined by floor area
  let baseCrew = 3;
  if (floorArea >= 30 && floorArea < 60) baseCrew = 4;
  else if (floorArea >= 60 && floorArea < 100) baseCrew = 5;
  else if (floorArea >= 100) baseCrew = 6;
  
  // Calculate total working days using crew-weighted daily burn rate
  // Cap at 90 working days — residential homes rarely exceed 3-4 months active work
  const dailyBurnRate = baseCrew * avgWage;
  const totalWorkingDays = Math.min(90, Math.ceil(laborCost / dailyBurnRate));
  
  // Define realistic crew fluctuations and day allocations per phase
  const phaseLogic = [
    { name: "Phase 1: Foundation & Masonry",        pct: 0.20, crew: baseCrew + 1, delay: 7,  delayNote: "curing & inspection" },
    { name: "Phase 2: Structural Framing & Walling",pct: 0.35, crew: baseCrew + 1, delay: 10, delayNote: "slab curing & inspection" },
    { name: "Phase 3: Roofing & Ceiling",           pct: 0.15, crew: Math.max(3, baseCrew - 1), delay: 3,  delayNote: "inspection" },
    { name: "Phase 4: Finishes & Tiling",           pct: 0.20, crew: Math.max(2, baseCrew - 1), delay: 5,  delayNote: "drying & inspection" },
    { name: "Phase 5: Plumbing, Elec. & Turnover",  pct: 0.10, crew: Math.max(2, baseCrew - 2), delay: 3,  delayNote: "final inspection" }
  ];
  
  let totalBuildDays = 0;
  const phases = phaseLogic.map(p => {
    const activeDays = Math.max(1, Math.ceil(totalWorkingDays * p.pct));
    const totalDays = activeDays + (p.delay || 0);
    
    totalBuildDays += totalDays;
    
    const displayName = p.delay ? `${p.name} (incl. ${p.delay}d ${p.delayNote})` : p.name;
    
    return { name: displayName, days: totalDays, workers: p.crew };
  });

  return { 
    stats: { workers: `${Math.max(2, baseCrew - 2)}-${baseCrew + 1}`, buildDays: totalBuildDays }, 
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
  if (["Main Door (Solid Wood Slab)", "Bedroom Door (Flush/Panel)", "CR Door (PVC/Aluminum)", "Door Jamb (Wood/Metal)", "Lockset / Doorknob", "Door Hinges (pair)", "Window Frame (Aluminum)", "Window Glass Panel (sqm)"].includes(key)) return "Doors & Windows";
  if (["PVC Orange Pipes 4\" (Sanitary)", "PVC Orange Pipes 2\" (Drainage)", "PPR Pipes 1/2\" (Water Supply)", "Sanitary Fittings (Orange)", "Water Supply Fittings (PPR)", "PVC Solvent / Teflon Tape", "Water Closet (Standard flush)", "Lavatory (Wall-hung/Pedestal)", "Kitchen Sink (Stainless)", "Shower Set (Head & Valve)", "Faucets & Angle Valves", "Floor Drain (4x4 Stainless)", "Septic Tank Components (CHB/Cement)"].includes(key)) return "Plumbing";
  if (["PVC Electrical Conduit 1/2\"", "Flexible Hose 1/2\" (50m)", "PVC Fittings & Boxes", "THHN Wire 2.0mm² (Lighting)", "THHN Wire 3.5mm² (Outlets)", "THHN Wire 5.5mm² (AC/Heater)", "Switches (1-3 gang)", "Outlets (2-gang CO)", "Lighting (LED/Pinlights)", "Panel Board & Circuit Breakers", "Electrical Tape"].includes(key)) return "Electrical";
  return "Finishes"; // Default for tiles, paint, ceiling
}

export function generateEstimate(data) {
  const typeKey = data.typeKey || "loft";
  const config = configs[typeKey] || configs["loft"];
  const grade = data.materialGrade || data.finishLevel || "Standard";
  
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
      
      // Apply color tint multiplier
      if (key === "topcoat" && theme) {
        let tintMult = 1.0;
        const t = theme.toLowerCase();
        if (t.includes("cream") || t.includes("cool") || t.includes("pastel")) tintMult = 1.15;
        if (t.includes("earth") || t.includes("tropical") || t.includes("minimalist")) tintMult = 1.30;
        
        priced.unitCost = priced.unitCost * tintMult;
        priced.total = priced.qty * priced.unitCost;
      }
      
      // Append specific brands if available
      let baseForBrand = priceName;
      if (priceName.startsWith("Architectural Topcoat Paint")) baseForBrand = "Architectural Topcoat Paint";
      if (BRAND_MAP[baseForBrand]) {
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

  let laborMultiplier = 0;
  if (typeKey === "half-amakan" || typeKey === "half-metal") {
    laborMultiplier = 0.30;
  } else if (typeKey === "chb") {
    laborMultiplier = 0.45;
  } else if (typeKey === "loft" || typeKey === "two-storey") {
    laborMultiplier = 0.50;
  } else {
    laborMultiplier = 0.45;
  }

  let contingencyMultiplier = 0.10;
  if (typeKey === "half-amakan" || typeKey === "half-metal") {
    contingencyMultiplier = 0.05;
  }

  let laborEstimate = totalMaterialsCost * laborMultiplier;

  // Calculate detailed labor breakdown based on standard DOLE regional wages
  const laborRoles = [
    { role: "Foreman / Lead", wage: 850, pct: 0.08 },
    { role: "Lead Mason", wage: 700, pct: 0.20 },
    { role: "Lead Carpenter", wage: 700, pct: 0.15 },
    { role: "Electrician", wage: 750, pct: 0.05 },
    { role: "Plumber", wage: 750, pct: 0.05 },
    { role: "Tile Setter", wage: 750, pct: 0.08 },
    { role: "Painter", wage: 700, pct: 0.05 },
    { role: "Helper / Ordinary Laborer", wage: 500, pct: 0.34 }
  ];

  let laborBreakdown = laborRoles.map(r => {
    const allocatedCost = laborEstimate * r.pct;
    const days = Math.max(1, Math.ceil(allocatedCost / r.wage));
    return {
      role: r.role,
      dailyWage: r.wage,
      days: days,
      total: days * r.wage
    };
  });

  // Recalculate laborEstimate exactly from the breakdown
  laborEstimate = laborBreakdown.reduce((sum, r) => sum + r.total, 0);

  let subTotal = totalMaterialsCost + laborEstimate;
  let contingency = subTotal * contingencyMultiplier;
  let grandTotal = subTotal + contingency;

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

  const floorArea = data.floorArea || (data.length * data.width) || 30;
  const forecasting = generateTimelineAndLabor(laborEstimate, floorArea);

  return {
    materialsList: formattedCategories,
    summary: {
      totalMaterials: totalMaterialsCost,
      laborEstimate: laborEstimate,
      laborBreakdown: laborBreakdown,
      contingency: contingency,
      grandTotal: grandTotal
    },
    feasibility,
    forecasting,
    reconciliationNote,
  };
}


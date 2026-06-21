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
  const totalManDays = Math.ceil(laborCost / avgWage);
  let crewSize = 3;
  if (floorArea >= 30 && floorArea < 60) crewSize = 4;
  else if (floorArea >= 60 && floorArea < 100) crewSize = 5;
  else if (floorArea >= 100) crewSize = 6;
  const buildDays = Math.max(7, Math.ceil(totalManDays / crewSize));
  
  const phases = [
    { name: "Phase 1: Foundation & Masonry", days: Math.max(2, Math.ceil(buildDays * 0.20)), workers: crewSize },
    { name: "Phase 2: Structural Framing & Walling", days: Math.max(2, Math.ceil(buildDays * 0.30)), workers: crewSize },
    { name: "Phase 3: Roofing & Ceiling", days: Math.max(1, Math.ceil(buildDays * 0.20)), workers: crewSize },
    { name: "Phase 4: Finishes & Tiling", days: Math.max(1, Math.ceil(buildDays * 0.20)), workers: crewSize },
    { name: "Phase 5: Plumbing, Elec. & Turnover", days: Math.max(1, Math.floor(buildDays * 0.10)), workers: crewSize }
  ];
  return { stats: { workers: crewSize, buildDays: buildDays }, phases: phases };
}

const KEY_MAP = {
  cement: "Cement (Mortar 40kg)",
  screenedSand: "Screened Sand",
  fineSand: "Fine Sand",
  gravel: "3/4 Gravel",
  rebar16mm: "16mm Deformed Bar (6m)",
  rebar12mm: "12mm Deformed Bar (6m)",
  rebar10mm: "10mm Deformed Bar (6m)",
  tieWire: "G.I. Tie Wire #16",
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
  topcoat: "Architectural Topcoat Paint",
  plasterCement: "Cement (Plastering 40kg)",
  handrail: "Handrail",
  newelPost: "Newel Post",
  phenolicBoard: "Phenolic Board 3/4\"",
  stairCocoLumber: "Coco Lumber",
  stairAdhesive: "Tile Adhesive (25kg bag)",
  stairGrout: "White Cement (Tile Grout)",
  stairTiles: "Floor Tile - Large (30-60 / 60x60)"
};

function getRoofName(rt) {
  const s = String(rt || "").toLowerCase();
  if (s.includes("corrugated") || s === "1") return "Corrugated GI Sheet / Yero";
  if (s.includes("long") || s === "2") return "Long Span Pre-Painted";
  if (s.includes("color") || s === "3") return "Color Roof Corrugated";
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
  if (["cement", "screenedSand", "fineSand", "gravel", "rebar16mm", "rebar12mm", "rebar10mm", "tieWire"].includes(key)) return "Foundation & Structure";
  if (["chb", "amakanSheets", "metalCladdingSheets", "cocoLumber", "rectTube"].includes(key)) return "Walling";
  if (["cPurlins", "ridgeCaps", "roofSheets", "roofLM"].includes(key)) return "Roofing";
  if (["handrail", "newelPost", "phenolicBoard", "stairCocoLumber", "stairTiles", "stairAdhesive", "stairGrout"].includes(key)) return "Stairs";
  return "Finishes";
}

export function generateEstimate(data) {
  const typeKey = data.typeKey || "loft";
  const config = configs[typeKey] || configs["loft"];
  const grade = data.materialGrade || data.finishLevel || "Standard";
  
  const rawQuantities = config.estimate(data);

  if (typeof rawQuantities === "string") {
    return { error: rawQuantities };
  }
  
  let formattedCategories = [];
  let totalMaterialsCost = 0;
  
  const catMap = {
    "Foundation & Structure": [],
    "Walling": [],
    "Roofing": [],
    "Stairs": [],
    "Finishes": []
  };

  for (const [key, qty] of Object.entries(rawQuantities)) {
    if (!qty || qty <= 0) continue;
    
    let priceName = KEY_MAP[key];
    if (key === "roofSheets" || key === "roofLM") priceName = getRoofName(data.roofType);
    if (key === "tiles") priceName = getTileName(data.tileSize);
    if (key === "boards") priceName = getBoardName(data.boardType);

    if (!priceName) {
      console.warn(`No price mapping for ${key}`);
      continue;
    }

    const priced = formatMaterialCost(priceName, Math.round(qty * 100) / 100, grade);
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

  let laborMultiplier = 0;
  if (typeKey === "half-amakan" || typeKey === "half-metal") {
    laborMultiplier = 0.40;
  } else if (typeKey === "chb") {
    laborMultiplier = 0.45;
  } else if (typeKey === "loft" || typeKey === "two-storey") {
    laborMultiplier = 0.50;
  } else {
    laborMultiplier = 0.45; // Default fallback
  }
  
  const laborEstimate = totalMaterialsCost * laborMultiplier;
  const subTotal = totalMaterialsCost + laborEstimate;
  
  const contingency = subTotal * 0.10;
  const grandTotal = subTotal + contingency;

  const budgetInput = data.budget || 0;
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
      contingency: contingency,
      grandTotal: grandTotal
    },
    feasibility,
    forecasting
  };
}

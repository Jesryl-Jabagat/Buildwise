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

function generateTimelineAndLabor(totalMaterialsCost, floorArea, materialsList = [], regionalLaborMult = 1.0, typeKey = "loft") {
  const laborRates = getLaborRates();
  const laborMultiplier = getLaborMultiplier(typeKey);

  // Waged roles with regional adjustment
  const wageCarpenter   = Math.round((laborRates["Lead Carpenter / Master Builder"] || 550) * regionalLaborMult);
  const wageMason       = Math.round((laborRates["Mason"] || 550) * regionalLaborMult);
  const wageHelper      = Math.round((laborRates["Helper / Ordinary Laborer"] || 400) * regionalLaborMult);
  const wageElectrician = Math.round((laborRates["Electrician"] || 600) * regionalLaborMult);
  const wagePlumber     = Math.round((laborRates["Plumber"] || 600) * regionalLaborMult);
  const wageTileSetter  = Math.round((laborRates["Tile Setter"] || 600) * regionalLaborMult);
  const wagePainter     = Math.round((laborRates["Painter"] || 550) * regionalLaborMult);

  // Detect work scopes from materials list
  const hasMasonryWork  = materialsList.some(c => c.category === "Foundation & Structure" || c.category === "Walling");
  const hasRoofingWork  = materialsList.some(c => c.category === "Roofing");
  const hasPlumbing     = materialsList.some(c => c.category === "Plumbing");
  const hasElectrical   = materialsList.some(c => c.category === "Electrical");
  const finishesCat     = materialsList.find(c => c.category === "Finishes");
  const hasCeiling      = finishesCat && finishesCat.items.some(i => i.name.toLowerCase().includes("ceiling") || i.name.toLowerCase().includes("board"));
  const hasTiles        = finishesCat && finishesCat.items.some(i => i.name.toLowerCase().includes("tile"));
  const hasPainting     = finishesCat && finishesCat.items.some(i => i.name.toLowerCase().includes("paint") || i.name.toLowerCase().includes("primer") || i.name.toLowerCase().includes("putty"));
  const hasFinishesPhase = Boolean(finishesCat && finishesCat.items.length > 0 && (hasTiles || hasPainting || hasCeiling));

  // Crew sizing based on floor area
  const masonCount  = hasMasonryWork ? (floorArea >= 70 ? 2 : 1) : 0;
  const helperCount = Math.max(2, Math.min(4, Math.ceil(floorArea / 25)));

  // Target labor estimate baseline from materials * laborMultiplier
  const targetLaborBudget = totalMaterialsCost * laborMultiplier;
  const baseCrewDailyBurn = (1 * wageCarpenter) + (masonCount * wageMason) + (helperCount * wageHelper);
  let totalWorkingDays = Math.round(targetLaborBudget / (baseCrewDailyBurn || 1));
  totalWorkingDays = Math.max(14, Math.min(90, totalWorkingDays));

  // Define phases with explicit assigned roles
  const activePhasesConfig = [];

  // Phase 1: Foundation & Masonry
  const p1Roles = {
    "Lead Carpenter / Master Builder": 1,
    "Helper / Ordinary Laborer": helperCount
  };
  if (masonCount > 0) p1Roles["Mason"] = masonCount;
  activePhasesConfig.push({
    key: "foundation",
    name: "Foundation & Masonry",
    rawPct: 0.25,
    delay: 7,
    delayNote: "curing & inspection",
    roles: p1Roles
  });

  // Phase 2: Structural Framing & Walling
  const p2Roles = {
    "Lead Carpenter / Master Builder": 1,
    "Helper / Ordinary Laborer": helperCount
  };
  if (masonCount > 0) p2Roles["Mason"] = masonCount;
  const isTwoLevel = typeKey === "two-storey" || typeKey === "loft" || floorArea >= 60;
  activePhasesConfig.push({
    key: "structural",
    name: "Structural Framing & Walling",
    rawPct: 0.35,
    delay: isTwoLevel ? 10 : 7,
    delayNote: isTwoLevel ? "slab curing & inspection" : "curing & inspection",
    roles: p2Roles
  });

  // Phase 3: Roofing (& Ceiling if present)
  if (hasRoofingWork || hasCeiling) {
    const p3Roles = {
      "Lead Carpenter / Master Builder": 1,
      "Helper / Ordinary Laborer": helperCount
    };
    activePhasesConfig.push({
      key: "roofing",
      name: hasCeiling ? "Roofing & Ceiling" : "Roofing",
      rawPct: 0.15,
      delay: 3,
      delayNote: "inspection",
      roles: p3Roles
    });
  }

  // Phase 4: Finishes & Tiling (if finishes materials exist)
  if (hasFinishesPhase) {
    const p4Roles = {
      "Lead Carpenter / Master Builder": 1,
      "Helper / Ordinary Laborer": helperCount
    };
    if (hasTiles) p4Roles["Tile Setter"] = 1;
    if (hasPainting) p4Roles["Painter"] = 1;
    if (!hasTiles && !hasPainting && masonCount > 0) p4Roles["Mason"] = 1;

    let p4Name = "Finishes";
    if (hasTiles && hasPainting) p4Name = "Finishes, Tiling & Painting";
    else if (hasTiles) p4Name = "Finishes & Tiling";
    else if (hasPainting) p4Name = "Finishes & Painting";

    activePhasesConfig.push({
      key: "finishes",
      name: p4Name,
      rawPct: 0.15,
      delay: 4,
      delayNote: "drying & inspection",
      roles: p4Roles
    });
  }

  // Final Phase: Utilities (Plumbing & Electrical) & Turnover
  const hasUtilitiesPhase = hasPlumbing || hasElectrical;
  if (hasUtilitiesPhase) {
    const utils = [];
    if (hasPlumbing) utils.push("Plumbing");
    if (hasElectrical) utils.push("Elec.");

    activePhasesConfig.push({
      key: "utilities",
      name: `${utils.join(", ")} & Turnover`,
      rawPct: 0.10,
      delay: 3,
      delayNote: "final inspection",
      isPackage: true,
      roles: {} // Subcontract pakyaw: handled as a specialized package rather than daily site laborers
    });
  } else {
    // Append turnover to the last active phase
    const lastP = activePhasesConfig[activePhasesConfig.length - 1];
    lastP.name += " & Turnover";
    lastP.delay += 2;
    lastP.delayNote += " & final inspection";
  }

  // Calculate activeDays per phase proportional to rawPct
  const totalRawPct = activePhasesConfig.reduce((sum, p) => sum + p.rawPct, 0);
  let allocatedActiveDays = 0;
  activePhasesConfig.forEach(p => {
    p.activeDays = Math.max(2, Math.round(totalWorkingDays * (p.rawPct / totalRawPct)));
    allocatedActiveDays += p.activeDays;
  });

  // Reconcile any rounding diff on the longest phase (Phase 2)
  const diff = totalWorkingDays - allocatedActiveDays;
  if (diff !== 0 && activePhasesConfig.length > 1) {
    activePhasesConfig[1].activeDays = Math.max(2, activePhasesConfig[1].activeDays + diff);
  }

  // Generate finalized phase objects
  let totalBuildDays = 0;
  const roleDaysMap = {}; // role -> total active days worked across phases
  const rolePhasesMap = {}; // role -> array of phase numbers (e.g. [1, 2, 3])

  const finalizedPhases = activePhasesConfig.map((p, index) => {
    const phaseNum = index + 1;
    const finalName = `Phase ${phaseNum}: ${p.name}`;
    const totalDays = p.activeDays + (p.delay || 0);
    totalBuildDays += totalDays;

    if (p.isPackage) {
      const displayName = p.delay ? `${finalName} (incl. ${p.delay}d ${p.delayNote})` : finalName;
      return {
        name: displayName,
        days: totalDays,
        activeDays: p.activeDays,
        workers: "Package",
        isPackage: true,
        crewDetails: "Specialized Subcontract (Pakyaw Package)"
      };
    }

    // Calculate total workers in this phase from role assignments
    let phaseWorkerCount = 0;
    const crewParts = [];
    for (const [role, count] of Object.entries(p.roles)) {
      if (count > 0) {
        phaseWorkerCount += count;
        // Track days worked by this role
        roleDaysMap[role] = (roleDaysMap[role] || 0) + p.activeDays;
        if (!rolePhasesMap[role]) rolePhasesMap[role] = [];
        rolePhasesMap[role].push(phaseNum);

        // Short label for crew summary
        let shortRole = role.split(" / ")[0];
        crewParts.push(`${count} ${shortRole}${count > 1 ? 's' : ''}`);
      }
    }

    const displayName = p.delay ? `${finalName} (incl. ${p.delay}d ${p.delayNote})` : finalName;

    return {
      name: displayName,
      days: totalDays,
      activeDays: p.activeDays,
      workers: phaseWorkerCount,
      crewDetails: crewParts.join(", ")
    };
  });

  // Build the unified labor breakdown
  const roleWages = {
    "Lead Carpenter / Master Builder": wageCarpenter,
    "Mason": wageMason,
    "Helper / Ordinary Laborer": wageHelper,
    "Tile Setter": wageTileSetter,
    "Painter": wagePainter
  };

  const roleWorkersMax = {
    "Lead Carpenter / Master Builder": 1,
    "Mason": masonCount,
    "Helper / Ordinary Laborer": helperCount,
    "Tile Setter": hasTiles ? 1 : 0,
    "Painter": hasPainting ? 1 : 0
  };

  const roleOrder = [
    "Lead Carpenter / Master Builder",
    "Mason",
    "Helper / Ordinary Laborer",
    "Tile Setter",
    "Painter"
  ];

  const laborBreakdown = [];
  roleOrder.forEach(role => {
    if (roleDaysMap[role] && roleDaysMap[role] > 0) {
      const workers = roleWorkersMax[role] || 1;
      const days = roleDaysMap[role];
      const dailyWage = roleWages[role] || 500;
      const total = workers * dailyWage * days;

      const assignedPhases = rolePhasesMap[role] || [];
      let phasesText = "";
      if (assignedPhases.length === finalizedPhases.length) {
        phasesText = "All Phases";
      } else if (assignedPhases.length > 0) {
        phasesText = `Phase${assignedPhases.length > 1 ? 's' : ''} ${assignedPhases.join(", ")}`;
      }

      laborBreakdown.push({
        role,
        workers,
        dailyWage,
        days,
        total,
        phasesText
      });
    }
  });

  // Specialized Pakyaw Subcontract Packages for Electrical & Plumbing
  const packagePhaseIndex = finalizedPhases.findIndex(p => p.isPackage);
  const packagePhaseText = packagePhaseIndex !== -1 ? `Phase ${packagePhaseIndex + 1}` : "Phase 4";
  const utilPhase = activePhasesConfig.find(p => p.key === "utilities");
  const utilDays = utilPhase?.activeDays || 4;

  if (hasElectrical) {
    const electricalPakyaw = Math.round(Math.max(4500, (floorArea * 150) + (utilDays * wageElectrician * 1.2)));
    laborBreakdown.push({
      role: "Electrical Works (Pakyaw Package)",
      isPackage: true,
      workers: "Package",
      dailyWage: "Pakyaw Contract",
      days: `${utilDays}d scope`,
      total: electricalPakyaw,
      phasesText: packagePhaseText
    });
  }

  if (hasPlumbing) {
    const plumbingPakyaw = Math.round(Math.max(4000, (floorArea * 120) + (utilDays * wagePlumber * 1.2)));
    laborBreakdown.push({
      role: "Plumbing Works (Pakyaw Package)",
      isPackage: true,
      workers: "Package",
      dailyWage: "Pakyaw Contract",
      days: `${utilDays}d scope`,
      total: plumbingPakyaw,
      phasesText: packagePhaseText
    });
  }

  const totalLaborCost = laborBreakdown.reduce((sum, r) => sum + r.total, 0);

  const numericWorkerCounts = finalizedPhases
    .filter(p => typeof p.workers === 'number' && !isNaN(p.workers))
    .map(p => p.workers);
  const minWorkers = numericWorkerCounts.length ? Math.min(...numericWorkerCounts) : 2;
  const maxWorkers = numericWorkerCounts.length ? Math.max(...numericWorkerCounts) : 4;
  const workersStat = minWorkers === maxWorkers ? `${minWorkers}` : `${minWorkers}-${maxWorkers}`;

  return {
    forecasting: {
      stats: {
        workers: workersStat,
        buildDays: totalBuildDays,
        workingDays: totalWorkingDays
      },
      phases: finalizedPhases
    },
    laborBreakdown: laborBreakdown,
    laborCost: totalLaborCost
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

function budgetFitEngine(materialsList, budget, totalLabor, contingency, typeKey, chosenGrade = "Standard", floorArea = 50) {
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
  
  // Dynamic grade calculation based on budget surplus & floor area
  const surplusRatio = budget / (totalCost || 1);
  const budgetPerSqm = budget / (floorArea || 1);
  
  let coreGrade = (chosenGrade === "Premium" || chosenGrade === "Mid-Range") ? "Premium" : chosenGrade === "Basic" ? "Basic" : "Standard";
  let utilGrade = "Standard";
  let finGrade = "Standard";

  if (chosenGrade === "Premium" || surplusRatio >= 1.25 || budgetPerSqm >= 20000) {
    coreGrade = "Premium";
    utilGrade = "Premium";
    finGrade = "Premium";
  } else if (chosenGrade === "Basic" && surplusRatio < 1.05 && budgetPerSqm < 14000) {
    coreGrade = "Basic";
    utilGrade = "Basic";
    finGrade = "Basic";
  }

  const upgradePath = [];
  if (surplusRatio >= 1.25) upgradePath.push('Upgraded to Premium Finishes & Fixtures');
  else upgradePath.push('Core → Standard Construction');

  return { 
    status: 'FITTED', 
    coreGrade, 
    utilitiesGrade: utilGrade, 
    finishesGrade: finGrade, 
    floorCost: totalCost, 
    upgradePath, 
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
          isPackage: catName === 'Plumbing' || catName === 'Electrical',
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

  const floorArea = data.floorArea || (data.length * data.width) || 30;
  
  // Call unified timeline and labor calculation
  const timelineAndLabor = generateTimelineAndLabor(
    totalMaterialsCost,
    floorArea,
    formattedCategories,
    regionalLaborMult,
    typeKey
  );

  let forecasting = timelineAndLabor.forecasting;
  let laborBreakdown = timelineAndLabor.laborBreakdown;
  let laborEstimate = timelineAndLabor.laborCost;

  let contingencyMultiplier = 0.05;

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


  const budgetFit = budgetFitEngine(formattedCategories, Number(data.budget), laborEstimate, contingency, typeKey, grade, Number(data.floorArea) || 50);

  return {
    budgetFit,
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


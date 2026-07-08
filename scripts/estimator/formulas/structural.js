/* ============================================================
   structural.js — Footings, columns, beams, and slabs
   ============================================================ */

export function calcGlobalDerived(length, width, wallHeight, soilCondition, isLightweight = false) {
  const totalWallLength = (length + width) * 2;
  
  // Full structural grid count
  const spacing = isLightweight ? 4 : 3;
  const colsL = Math.ceil(length / spacing) + 1;
  const colsW = Math.ceil(width / spacing) + 1;
  const numCols = colsL * colsW;
  
  const numBeams = Math.ceil(length / spacing) + Math.ceil(width / spacing);
  const soilMultiplier = soilCondition === "soft" ? 1.3 : 1.0;
  const floorArea = length * width;
  const wallArea = totalWallLength * wallHeight;
  
  return { numCols, numBeams, soilMultiplier, floorArea, wallArea, totalWallLength };
}

export function calcFootingsAndColumns1Storey(numCols, soilMultiplier) {
  // 1-Storey / Lightweight Footing (Budget optimized)
  const footingCement = numCols * 3;
  const footingSand = numCols * 0.2;
  const footingGravel = numCols * 0.3;
  const footingRebar10mm = numCols * 1.5; // Switch to 10mm for budget
  const footingTieWire = numCols * 0.2;

  // 1-Storey / Lightweight Column (Budget optimized)
  const columnCement = numCols * 2;
  const columnSand = numCols * 0.1;
  const columnGravel = numCols * 0.2;
  const columnRebar10mm = numCols * 4; // 4 vertical bars of 10mm + ties
  const columnTieWire = numCols * 0.5;

  return {
    cement: (footingCement + columnCement) * soilMultiplier,
    screenedSand: (footingSand + columnSand) * soilMultiplier,
    gravel: (footingGravel + columnGravel) * soilMultiplier,
    rebar10mm: footingRebar10mm + columnRebar10mm
  };
}

export function calcFootingsAndColumns2Storey(numCols, soilMultiplier) {
  // 2-Storey Heavy Footing
  const footingCement = numCols * 9;
  const footingSand = numCols * 0.5;
  const footingGravel = numCols * 0.9;
  const footingRebar16mm = numCols * 4;
  const footingTieWire = numCols * 0.5;

  // 2-Storey 1F Heavy Column
  const columnCement = numCols * 3;
  const columnSand = numCols * 0.2;
  const columnGravel = numCols * 0.3;
  const columnRebar16mm = numCols * 6;
  const columnRebar12mm = numCols * 12;
  const columnTieWire = numCols * 1.6;

  return {
    cement: (footingCement + columnCement) * soilMultiplier,
    screenedSand: (footingSand + columnSand) * soilMultiplier,
    gravel: (footingGravel + columnGravel) * soilMultiplier,
    rebar16mm: footingRebar16mm + columnRebar16mm,
    rebar12mm: columnRebar12mm
  };
}

export function calcColumns2Storey2F(numCols, soilMultiplier) {
  // 2-Storey 2F Column
  const columnCement = numCols * 2;
  const columnSand = numCols * 0.1;
  const columnGravel = numCols * 0.2;
  const columnRebar16mm = numCols * 3;
  const columnRebar12mm = numCols * 11;
  const columnTieWire = numCols * 0.6;

  return {
    cement: columnCement * soilMultiplier,
    screenedSand: columnSand * soilMultiplier,
    gravel: columnGravel * soilMultiplier,
    rebar16mm: columnRebar16mm,
    rebar12mm: columnRebar12mm
  };
}

export function calcBeams1Storey(numBeams) {
  return {
    cement: 2 * numBeams,
    screenedSand: 0.1 * numBeams,
    gravel: 0.2 * numBeams,
    rebar16mm: 6 * numBeams,
    rebar10mm: 11 * numBeams
  };
}

export function calcBeams2Storey(numBeams) {
  return {
    cement: 5 * numBeams,
    screenedSand: 0.3 * numBeams,
    gravel: 0.5 * numBeams,
    rebar16mm: 15 * numBeams,
    rebar10mm: 23 * numBeams
  };
}

export function calcGroundSlab(floorArea) {
  const slabVol = floorArea * 0.10;
  return {
    cement: slabVol * 9,
    screenedSand: slabVol * 0.5,
    gravel: slabVol * 1.0
  };
}

export function calcLightweightSlab(floorArea) {
  // 3 inches (0.075m) thickness for budget lightweight
  const slabVol = floorArea * 0.075;
  return {
    cement: slabVol * 9,
    screenedSand: slabVol * 0.5,
    gravel: slabVol * 1.0
  };
}

export function calcUpperSlab(area) {
  const slabVol = area * 0.125;
  return {
    cement: slabVol * 12,
    screenedSand: slabVol * 0.5,
    gravel: slabVol * 1.0
  };
}

export function calcEarthworks(floorArea, totalWallLength) {
  // Excavation based on perimeter (footings) and depth
  const excavationVol = totalWallLength * 0.8 * 1.0; // 0.8m width, 1.0m depth
  return {
    "Excavation / Backfill": excavationVol,
    "Soil Poisoning / Termite Treatment": floorArea
  };
}

export function calcFormworks(floorArea) {
  // Rough estimate for formworks area based on floor area
  const formworksArea = floorArea * 1.5; 
  return {
    "Formworks (Plywood & Lumber)": formworksArea
  };
}

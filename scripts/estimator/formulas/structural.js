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
  // 1-Storey / Lightweight Footing (Residential-grade)
  const footingCement = numCols * 2;
  const footingSand = numCols * 0.12;
  const footingGravel = numCols * 0.18;
  const footingRebar10mm = numCols * 1; // 10mm for budget footings
  const footingTieWire = numCols * 0.15;

  // 1-Storey / Lightweight Column (Residential-grade)
  const columnCement = numCols * 1.5;
  const columnSand = numCols * 0.08;
  const columnGravel = numCols * 0.12;
  const columnRebar10mm = numCols * 3; // 4 vertical bars of 10mm + ties
  const columnTieWire = numCols * 0.3;

  return {
    cement: (footingCement + columnCement) * soilMultiplier,
    screenedSand: (footingSand + columnSand) * soilMultiplier,
    gravel: (footingGravel + columnGravel) * soilMultiplier,
    rebar10mm: footingRebar10mm + columnRebar10mm
  };
}

export function calcFootingsAndColumns2Storey(numCols, soilMultiplier) {
  // 2-Storey Residential Footing
  const footingCement = numCols * 4;
  const footingSand = numCols * 0.25;
  const footingGravel = numCols * 0.4;
  const footingRebar16mm = numCols * 2;
  const footingTieWire = numCols * 0.3;

  // 2-Storey 1F Residential Column
  const columnCement = numCols * 2;
  const columnSand = numCols * 0.12;
  const columnGravel = numCols * 0.18;
  const columnRebar16mm = numCols * 4;
  const columnRebar12mm = numCols * 6;
  const columnTieWire = numCols * 0.8;

  return {
    cement: (footingCement + columnCement) * soilMultiplier,
    screenedSand: (footingSand + columnSand) * soilMultiplier,
    gravel: (footingGravel + columnGravel) * soilMultiplier,
    rebar16mm: footingRebar16mm + columnRebar16mm,
    rebar12mm: columnRebar12mm
  };
}

export function calcColumns2Storey2F(numCols, soilMultiplier) {
  // 2-Storey 2F Column (lighter than 1F)
  const columnCement = numCols * 1.5;
  const columnSand = numCols * 0.08;
  const columnGravel = numCols * 0.12;
  const columnRebar16mm = numCols * 2;
  const columnRebar12mm = numCols * 5;
  const columnTieWire = numCols * 0.4;

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
    cement: 1.5 * numBeams,
    screenedSand: 0.08 * numBeams,
    gravel: 0.12 * numBeams,
    rebar16mm: 3 * numBeams,
    rebar10mm: 6 * numBeams
  };
}

export function calcBeams2Storey(numBeams) {
  return {
    cement: 2.5 * numBeams,
    screenedSand: 0.15 * numBeams,
    gravel: 0.25 * numBeams,
    rebar16mm: 6 * numBeams,
    rebar10mm: 12 * numBeams
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
  // Excavation based on perimeter (strip footings) — residential depth
  const excavationVol = totalWallLength * 0.5 * 0.6; // 0.5m width, 0.6m depth for residential strip footings
  return {
    "Excavation / Backfill": excavationVol,
    "Soil Poisoning / Termite Treatment": floorArea
  };
}

export function calcFormworks(floorArea) {
  // Rough estimate for formworks area based on floor area — residential scale
  const formworksArea = floorArea * 0.7; 
  return {
    "Formworks (Plywood & Lumber)": formworksArea
  };
}

/* ============================================================
   structural.js — Footings, columns, beams, and slabs
   ============================================================ */

export function calcGlobalDerived(length, width, wallHeight, soilCondition) {
  // New logical structural count: 1 column per 3 meters of perimeter
  const totalWallLength = (length + width) * 2;
  const numCols = Math.ceil(totalWallLength / 3);
  const numBeams = Math.ceil(length / 3) + Math.ceil(width / 3);
  const soilMultiplier = soilCondition === "soft" ? 1.3 : 1.0;
  const floorArea = length * width;
  const wallArea = totalWallLength * wallHeight;
  return { numCols, numBeams, soilMultiplier, floorArea, wallArea, totalWallLength };
}

export function calcFootingsAndColumns1Storey(numCols, soilMultiplier) {
  // Enforcing strict math from user:
  const footingCement = numCols * 3;
  const footingSand = numCols * 0.2;
  const footingGravel = numCols * 0.3;
  const footingRebar16mm = numCols * 2;

  const columnCement = numCols * 2;
  const columnSand = numCols * 0.1;
  const columnGravel = numCols * 0.2;
  const columnRebar16mm = numCols * 3;
  const columnRebar10mm = numCols * 11;

  return {
    cement: (footingCement + columnCement) * soilMultiplier,
    screenedSand: (footingSand + columnSand) * soilMultiplier,
    gravel: (footingGravel + columnGravel) * soilMultiplier,
    rebar16mm: footingRebar16mm + columnRebar16mm,
    rebar10mm: columnRebar10mm
  };
}

export function calcFootingsAndColumns2Storey(numCols, soilMultiplier) {
  // For 2-storey, use 1-storey base but multiply column rebar by 2.
  const footingCement = numCols * 3;
  const footingSand = numCols * 0.2;
  const footingGravel = numCols * 0.3;
  const footingRebar16mm = numCols * 2;

  const columnCement = numCols * 2;
  const columnSand = numCols * 0.1;
  const columnGravel = numCols * 0.2;
  const columnRebar16mm = (numCols * 3) * 2; // Multiply by 2 for height
  const columnRebar10mm = (numCols * 11) * 2; // Multiply by 2 for height

  return {
    cement: (footingCement + columnCement) * soilMultiplier,
    screenedSand: (footingSand + columnSand) * soilMultiplier,
    gravel: (footingGravel + columnGravel) * soilMultiplier,
    rebar16mm: footingRebar16mm + columnRebar16mm,
    rebar10mm: columnRebar10mm
  };
}

export function calcBeams1Storey(numBeams) {
  return {
    cement: 2 * numBeams,
    screenedSand: 0.1 * numBeams,
    gravel: 0.2 * numBeams,
    rebar16mm: 6 * numBeams,
    rebar10mm: 11 * numBeams,
    tieWire: 0.8 * numBeams
  };
}

export function calcBeams2Storey(numBeams) {
  return {
    cement: 5 * numBeams,
    screenedSand: 0.3 * numBeams,
    gravel: 0.5 * numBeams,
    rebar16mm: 15 * numBeams,
    rebar10mm: 23 * numBeams,
    tieWire: 2.0 * numBeams
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

export function calcUpperSlab(area) {
  const slabVol = area * 0.125;
  return {
    cement: slabVol * 12,
    screenedSand: slabVol * 0.5,
    gravel: slabVol * 1.0
  };
}

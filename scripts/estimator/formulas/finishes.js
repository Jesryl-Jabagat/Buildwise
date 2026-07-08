/* ============================================================
   finishes.js — Tiling, ceiling, and painting
   ============================================================ */

export function calcPlastering(wallArea) {
  return {
    plasterCement: (wallArea * 2) * 0.288,
    fineSand: (wallArea * 2) * 0.016
  };
}

export function calcPainting(wallArea) {
  // 30 sqm/gal coverage. Factor of 2 accounts for both sides and 2 coats.
  return {
    primer: Math.ceil((wallArea / 30) * 2),
    topcoat: Math.ceil((wallArea / 30) * 2),
    concretePutty: Math.ceil(wallArea / 25),
    paintAccessories: Math.ceil(wallArea / 100) || 1,
    paintThinner: Math.ceil((wallArea / 30) * 0.5),
    sandpaper: Math.ceil(wallArea / 50) || 1
  };
}

export function calcTiling(area, tileSizeStr, breakageAllowance = 5) {
  if (area <= 0) return {};
  const TILES_PER_SQM = {
    "7.5x7.5": 177.8,
    "10x10": 100,
    "10.6x10.6": 88.4,
    "10x20": 50,
    "15x15": 44.44,
    "15x20": 33.33,
    "15x30": 22.22,
    "20x20": 25,
    "20x30": 16.66,
    "20x40": 12.5,
    "25x25": 16,
    "30x30": 11,
    "30x60": 5.56,
    "40x40": 6.25,
    "50x50": 4,
    "60x60": 2.78
  };
  const tilesPerSqm = TILES_PER_SQM[tileSizeStr] || 16;
  const breakageFactor = 1 + (breakageAllowance / 100);
  
  return {
    tiles: Math.ceil(tilesPerSqm * area * breakageFactor),
    mortarCement: area * 0.086,
    whiteCement: area * 0.50,
    tileAdhesive: area * 0.11
  };
}

export function calcCeiling(ceilingArea, length, width, wastage = 5) {
  if (ceilingArea <= 0) return {};
  const areaWithWastage = ceilingArea * (1 + wastage / 100);
  const boards = Math.ceil(areaWithWastage / 2.88);
  return {
    boards: boards,
    wallAngles: Math.ceil(((length + width) * 2) / 3),
    channels: Math.ceil(width / 1.2) * Math.ceil(length / 6),
    furring: Math.ceil(length / 0.4) * Math.ceil(width / 3),
    "Foil Insulation (roll)": Math.ceil(ceilingArea / 50) // Assuming 50sqm per roll
  };
}

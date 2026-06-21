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
  const paintArea = wallArea * 2;
  return {
    primer: Math.ceil(paintArea / 30) * 2,
    topcoat: Math.ceil(paintArea / 30) * 2
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
  return {
    boards: Math.ceil(areaWithWastage / 2.88),
    wallAngles: Math.ceil(((length + width) * 2) / 3),
    channels: Math.ceil(width / 1.2) * Math.ceil(length / 6),
    furring: Math.ceil(length / 0.4) * Math.ceil(width / 3)
  };
}

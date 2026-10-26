/* ============================================================
   walling.js — CHB walls and light wall cladding
   ============================================================ */

export function calcFullCHBWalls(wallArea, openingDeduction = 0) {
  const netArea = Math.max(0, wallArea - openingDeduction);
  const totalCHB = Math.ceil(netArea * 12.5 * 1.05);
  return {
    chb: totalCHB,
    cement: netArea * 0.525,
    screenedSand: netArea * 0.0438,
    rebar10mm: Math.ceil((netArea * 1.5 / 6) + (netArea * 1.2 / 6))
  };
}

export function calcHalfCHBWalls(length, width, chbBaseWallHeight, openingDeduction = 0) {
  const totalWallLength = (length + width) * 2;
  const lowerWallAreaSqm = totalWallLength * chbBaseWallHeight;
  const netArea = Math.max(0, lowerWallAreaSqm - openingDeduction);
  const totalCHB = Math.ceil((netArea * 12.5) * 1.05);
  return {
    chbWallArea: netArea, 
    chb: totalCHB,
    cement: netArea * 0.525,
    screenedSand: netArea * 0.0438,
    rebar10mm: Math.ceil((netArea * 1.5 / 6) + (netArea * 1.2 / 6))
  };
}

export function calcLightWalls(length, width, effectiveWallHeight, wallingMaterialType) {
  const perimeter = (length + width) * 2;
  
  // New formula: ROUNDUP(Perimeter ÷ 1.2) × ROUNDUP(1.8 ÷ 2.4) × 1.05
  const sheetBase = Math.ceil(perimeter / 1.2) * Math.ceil(effectiveWallHeight / 2.4);
  const totalLightweightSheets = Math.ceil(sheetBase * 1.05);
  
  // Steel Tubing for Upper Frame: ROUNDUP(Perimeter ÷ 1.2)
  const totalRectangularTubes = Math.ceil(perimeter / 1.2);

  const res = {
    amakanSheets: 0,
    metalCladdingSheets: 0,
    cocoLumber: 0,
    rectTube: 0
  };

  if (wallingMaterialType === "amakan") {
    res.amakanSheets = totalLightweightSheets;
    // Budget Coco Lumber framing: 2 board feet per linear meter of perimeter for studs/nailers
    res.cocoLumber = Math.ceil(perimeter * 2);
  } else if (wallingMaterialType === "metalCladding") {
    res.metalCladdingSheets = totalLightweightSheets;
    // Budget Metal Cladding: spacing every 1.5m instead of 1.2m
    res.rectTube = Math.ceil(perimeter / 1.5);
  }

  return res;
}

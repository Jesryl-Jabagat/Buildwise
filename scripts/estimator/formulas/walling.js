/* ============================================================
   walling.js — CHB walls and light wall cladding
   ============================================================ */

export function calcFullCHBWalls(wallArea) {
  const totalCHB = Math.ceil(wallArea * 12.5 * 1.05);
  return {
    chb: totalCHB,
    cement: wallArea * 0.525,
    screenedSand: wallArea * 0.0438,
    rebar10mm: Math.ceil((wallArea * 2.93 / 6) + (wallArea * 2.50 / 6))
  };
}

export function calcHalfCHBWalls(length, width, chbBaseWallHeight) {
  const totalWallLength = (length + width) * 2;
  const lowerWallAreaSqm = totalWallLength * chbBaseWallHeight;
  const totalCHB = Math.ceil((lowerWallAreaSqm * 12.5) * 1.05);
  return {
    chbWallArea: lowerWallAreaSqm, 
    chb: totalCHB,
    cement: lowerWallAreaSqm * 0.525,
    screenedSand: lowerWallAreaSqm * 0.0438,
    rebar10mm: Math.ceil((lowerWallAreaSqm * 2.93 / 6) + (lowerWallAreaSqm * 2.50 / 6))
  };
}

export function calcLightWalls(length, width, effectiveWallHeight, wallingMaterialType) {
  const totalWallLength = (length + width) * 2;
  
  // Upper Wall (Amakan/Metal Sheets): totalLightweightSheets = Math.ceil(totalWallLength / 2.4);
  const totalLightweightSheets = Math.ceil(totalWallLength / 2.4);
  
  // Steel Tubing for Upper Frame: totalRectangularTubes = Math.ceil(totalWallLength / 1.2);
  const totalRectangularTubes = Math.ceil(totalWallLength / 1.2);

  const res = {
    amakanSheets: 0,
    metalCladdingSheets: 0,
    cocoLumber: 0,
    rectTube: 0
  };

  if (wallingMaterialType === "amakan") {
    res.amakanSheets = totalLightweightSheets;
    res.cocoLumber = totalRectangularTubes * 4; // keeping the coco lumber conversion from tubes as the old code had ((studs)*2)*4
  } else if (wallingMaterialType === "metalCladding") {
    res.metalCladdingSheets = totalLightweightSheets;
    res.rectTube = totalRectangularTubes;
  }

  return res;
}

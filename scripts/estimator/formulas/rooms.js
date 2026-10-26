/* ============================================================
   rooms.js — Bedrooms, comfort rooms, and stairs
   ============================================================ */

export function calcBedroomsTableA(count, wallingMaterialType) {
  if (!count) return {};
  const isLight = wallingMaterialType === "amakan" || wallingMaterialType === "metalCladding";
  
  if (isLight) {
    // 2-Wall Trick (Inner Perimeter = 5m fallback for 2m x 3m minimum habitable space)
    // Deduct interior bedroom door opening (0.8m width) at the 0.9m CHB base
    const innerPerimeter = 5;
    const doorOpeningAtBase = 0.8 * 0.9;
    const chbArea = Math.max(0, (innerPerimeter * 0.9) - doorOpeningAtBase);
    const sheetCount = Math.ceil(Math.ceil(innerPerimeter / 1.2) * Math.ceil(1.8 / 2.4) * 1.05) * count;
    
    return {
      chb: Math.ceil(chbArea * 12.5 * 1.05) * count,
      cement: chbArea * 0.525 * count,
      screenedSand: chbArea * 0.0438 * count,
      rebar10mm: Math.ceil((chbArea * 2.7) / 6) * count,
      amakanSheets: wallingMaterialType === "amakan" ? sheetCount : 0,
      metalCladdingSheets: wallingMaterialType === "metalCladding" ? sheetCount : 0,
      rectTube: Math.ceil(innerPerimeter / 1.2) * count
    };
  }
  
  // Default CHB Residential Bedroom (standard 3m×3m partition walls)
  // Interior partitions don't need structural columns/beams — only light 10mm vertical dowels
  return {
    chb: 60 * count,           // ~60 blocks for a 2-wall partition (not 100)
    cement: 6 * count,          // mortar only, no structural concrete
    screenedSand: 0.2 * count,
    rebar10mm: 4 * count        // light vertical dowels only, no heavy 16mm/12mm
  };
}

export function calcBedroomsTableB(count) {
  return calcBedroomsTableA(count, "chb");
}

export function calcBedroomsTableC(count) {
  return calcBedroomsTableA(count, "chb");
}

export function calcBedroomsTableD(count) {
  return calcBedroomsTableA(count, "chb");
}

export function calcCRsTableA(count, wallingMaterialType) {
  if (!count) return {};
  const isLight = wallingMaterialType === "amakan" || wallingMaterialType === "metalCladding";
  
  if (isLight) {
    // 2-Wall Trick CR (Inner Perimeter = 2.9m fallback for 1.2m x 1.7m CR)
    // CR in lightweight houses uses CHB partition up to standard 2.1m door height
    // Deduct standard CR door opening (0.7m x 2.1m = 1.47 sqm)
    const innerPerimeter = 2.9;
    const crDoorArea = 0.7 * 2.1;
    const wallArea = Math.max(0, (innerPerimeter * 2.1) - crDoorArea);
    
    return {
      chb: Math.ceil(wallArea * 12.5 * 1.05) * count,
      cement: wallArea * 0.525 * count,
      screenedSand: wallArea * 0.0438 * count,
      rebar10mm: Math.ceil((wallArea * 2.7) / 6) * count
    };
  }
  
  // Default CHB CR (residential 1.2m×1.7m)
  return {
    chb: 50 * count,
    cement: 4 * count,
    screenedSand: 0.2 * count,
    rebar10mm: 3 * count
  };
}

export function calcCRsTableB(count) {
  return calcCRsTableA(count, "chb");
}

export function calcStairs() {
  return {
    cement: 20,
    screenedSand: 1, 
    gravel: 2,
    rebar12mm: 12,
    rebar10mm: 8
  };
}

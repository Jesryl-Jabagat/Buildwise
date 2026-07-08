/* ============================================================
   rooms.js — Bedrooms, comfort rooms, and stairs
   ============================================================ */

export function calcBedroomsTableA(count, wallingMaterialType) {
  if (!count) return {};
  const isLight = wallingMaterialType === "amakan" || wallingMaterialType === "metalCladding";
  
  if (isLight) {
    // 2-Wall Trick (Inner Perimeter = 5m fallback for 2m x 3m minimum habitable space)
    const innerPerimeter = 5;
    const chbArea = innerPerimeter * 0.9;
    const sheetCount = Math.ceil(Math.ceil(innerPerimeter / 1.2) * Math.ceil(1.8 / 2.4) * 1.05) * count;
    
    return {
      chb: Math.ceil(chbArea * 12.5 * 1.05) * count,
      cement: chbArea * 0.525 * count,
      screenedSand: chbArea * 0.0438 * count,
      rebar10mm: Math.ceil((chbArea * 5.43) / 6) * count,
      amakanSheets: wallingMaterialType === "amakan" ? sheetCount : 0,
      metalCladdingSheets: wallingMaterialType === "metalCladding" ? sheetCount : 0,
      rectTube: Math.ceil(innerPerimeter / 1.2) * count
    };
  }
  
  // Default CHB Standard Heavy Bedroom (Fixed 4-Wall constants)
  return {
    chb: 178 * count,
    cement: 25 * count,
    screenedSand: 0.5 * count,
    gravel: 0.9 * count,
    rebar16mm: 17 * count,
    rebar12mm: 31 * count,
    rebar10mm: 12 * count
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
    // CRs even in lightweight houses use Full CHB for moisture reasons.
    const innerPerimeter = 2.9;
    const wallArea = innerPerimeter * 2.7;
    
    return {
      chb: Math.ceil(wallArea * 12.5 * 1.05) * count,
      cement: wallArea * 0.525 * count,
      screenedSand: wallArea * 0.0438 * count,
      rebar10mm: Math.ceil((wallArea * 5.43) / 6) * count
    };
  }
  
  // Default CHB CR
  return {
    chb: 71 * count,
    cement: 7 * count,
    screenedSand: 0.3 * count,
    rebar10mm: 5 * count
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

/* ============================================================
   rooms.js — Bedrooms, comfort rooms, and stairs
   ============================================================ */

export function calcBedroomsTableA(count, wallingMaterialType) {
  if (!count) return {};
  return {
    // Stripped structural elements to avoid double-counting against the perimeter envelope
    primer: 0.25 * count,
    topcoat: 0.25 * count
  };
}

export function calcBedroomsTableB(count) {
  if (!count) return {};
  return {
    primer: 2 * count,
    topcoat: 2 * count
  };
}

export function calcBedroomsTableC(count) {
  if (!count) return {};
  return {
    primer: 2 * count,
    topcoat: 2 * count
  };
}

export function calcBedroomsTableD(count) {
  if (!count) return {};
  return {
    primer: 2 * count,
    topcoat: 2 * count
  };
}

export function calcCRsTableA(count, wallingMaterialType) {
  if (!count) return {};
  return {
    primer: 0.2 * count,
    topcoat: 0.2 * count
  };
}

export function calcCRsTableB(count) {
  if (!count) return {};
  return {
    primer: 0.4 * count,
    topcoat: 0.4 * count
  };
}

export function calcStairs() {
  return {
    cement: 20,
    screenedSand: 1,
    gravel: 2,
    rebar12mm: 12,
    rebar10mm: 8,
    handrail: 5,
    newelPost: 2,
    phenolicBoard: 4,
    stairCocoLumber: 120,
    stairTiles: 15,
    stairAdhesive: 3,
    stairGrout: 2
  };
}

// scripts/utils/calc-helpers.js
//
// Small shared helpers used across every formula module.

export function roundUp(value) {
  return Math.ceil(value);
}

export function round2(value) {
  return Math.round(value * 100) / 100;
}

export function mergeMaterials(...lists) {
  const map = new Map();
  for (const list of lists) {
    if (!list) continue;
    for (const item of list) {
      if (!item) continue;
      const key = `${item.name}__${item.unit}`;
      if (map.has(key)) {
        map.get(key).qty += item.qty;
      } else {
        map.set(key, { ...item });
      }
    }
  }
  return Array.from(map.values()).map((item) => ({
    ...item,
    qty: round2(item.qty),
  }));
}

export function scaleMaterials(baseList, multiplier) {
  if (!multiplier || multiplier <= 0) return [];
  return baseList.map((item) => ({
    ...item,
    qty: item.qty * multiplier,
  }));
}

export function sumObjects(...objs) {
  const result = {};
  for (const obj of objs) {
    if (!obj) continue;
    for (const key in obj) {
      if (typeof obj[key] === 'number') {
        result[key] = (result[key] || 0) + obj[key];
      }
    }
  }
  return result;
}

export function validateInputs(data, houseType) {
  const length = data.length || data.groundLength || 0;
  const width = data.width || data.groundWidth || 0;
  const wallHeight = data.wallHeight || data.groundWallHeight || 2.7;
  const floorArea = length * width;

  if (length <= 0 || width <= 0) {
    return "Length and width must be greater than zero.";
  }

  if (houseType === "loft") {
    const mezzLength = data.mezzanineLength || 0;
    const mezzWidth = data.mezzanineWidth || 0;
    if (mezzLength * mezzWidth > floorArea * 0.50) {
      return "Mezzanine area cannot exceed 50% of the ground floor area.";
    }
  }

  if (houseType === "half-metal" || houseType === "half-amakan") {
    const chbBaseWallHeight = data.chbBaseWallHeight || 1.5;
    if (chbBaseWallHeight >= wallHeight) {
      return "CHB base wall height must be less than total wall height.";
    }
  }

  if (wallHeight < 2.0) {
    return "Wall height must be at least 2.0 meters.";
  }

  const tileBreakage = data.tileBreakage !== undefined ? data.tileBreakage : 5;
  if ((data.applyTilesGround || data.applyTilesSecond) && (tileBreakage < 5 || tileBreakage > 10)) {
    return "Tile breakage allowance must be between 5% and 10%.";
  }

  return null; // Valid
}

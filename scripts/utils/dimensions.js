/**
 * Shared Dimension & Spatial Scaling Utilities.
 * Ensures house footprint and floor area reflect the exact sqm given by the user.
 */

export function findOptimalDimensions(targetArea) {
  const area = Math.max(10, Number(targetArea) || 30);
  const idealRatio = 1.25;
  const idealW = Math.sqrt(area / idealRatio);

  let bestScore = Infinity;
  let bestW = Math.round(idealW * 2) / 2;
  let bestL = Math.round((area / bestW) * 10) / 10;

  const minW = Math.max(3, Math.floor(idealW * 0.7));
  const maxW = Math.ceil(idealW * 1.3);

  for (let w = minW; w <= maxW; w += 0.5) {
    let l = Math.round((area / w) * 2) / 2;
    let diff = Math.abs(w * l - area);
    if (diff > 0.05) {
      l = Math.round((area / w) * 10) / 10;
      diff = Math.abs(w * l - area);
    }
    const len = Math.max(w, l);
    const wid = Math.min(w, l);
    const ratio = len / wid;
    // Score based on area diff (heavily weighted) and ratio proximity to 1.25
    const score = diff * 100 + Math.abs(ratio - idealRatio);
    if (score < bestScore) {
      bestScore = score;
      bestW = wid;
      bestL = len;
    }
  }

  return {
    length: bestL,
    width: bestW,
    area: Math.round(bestL * bestW * 10) / 10
  };
}

export function calculateTargetDimensions(typeKey, targetArea) {
  const area = Math.max(20, Number(targetArea) || 60);

  if (typeKey === 'two-storey') {
    // Total floor area = targetArea. Each floor = targetArea / 2
    const floorArea = area / 2;
    const { length, width } = findOptimalDimensions(floorArea);
    return {
      length,
      width,
      groundLength: length,
      groundWidth: width,
      secondFloorLength: length,
      secondFloorWidth: width,
      totalFloorArea: Math.round((length * width) * 2 * 10) / 10
    };
  } else if (typeKey === 'loft') {
    // Total floor area = ground floor area + mezzanine area.
    // Mezzanine is max 50% of ground floor (code compliance): groundArea + 0.5 * groundArea = 1.5 * groundArea = area
    const groundArea = area / 1.5;
    const { length, width } = findOptimalDimensions(groundArea);
    const mezLen = Math.round((length * 0.5) * 10) / 10;
    const mezWid = width;
    return {
      length,
      width,
      groundLength: length,
      groundWidth: width,
      mezzanineLength: mezLen,
      mezzanineWidth: mezWid,
      totalFloorArea: Math.round(((length * width) + (mezLen * mezWid)) * 10) / 10
    };
  } else {
    // Single storey: CHB, Half-Amakan, Half-Metal
    const { length, width } = findOptimalDimensions(area);
    return {
      length,
      width,
      groundLength: length,
      groundWidth: width,
      totalFloorArea: Math.round(length * width * 10) / 10
    };
  }
}

export function getRecommendedRooms(typeKey, totalFloorArea) {
  if (typeKey === 'two-storey') {
    return {
      bedrooms1F: totalFloorArea >= 180 ? 2 : totalFloorArea > 65 ? 1 : 0,
      crs1F: totalFloorArea > 100 ? 2 : 1,
      bedrooms2F: totalFloorArea >= 220 ? 4 : totalFloorArea > 90 ? 3 : 2,
      crs2F: totalFloorArea > 70 ? 2 : 1,
    };
  } else if (typeKey === 'loft') {
    return {
      bedrooms1F: totalFloorArea >= 180 ? 2 : 1,
      crs1F: totalFloorArea >= 120 ? 2 : 1,
      bedrooms2F: 1, // Master loft suite
      crs2F: totalFloorArea >= 60 ? 1 : 0,
    };
  } else {
    // Single-storey (CHB, Half-Amakan, Half-Metal)
    let bed1 = 1;
    let cr1 = 1;
    if (totalFloorArea <= 36) {
      bed1 = 1; cr1 = 1;
    } else if (totalFloorArea <= 60) {
      bed1 = 2; cr1 = 1;
    } else if (totalFloorArea <= 95) {
      bed1 = 3; cr1 = 2;
    } else if (totalFloorArea <= 135) {
      bed1 = 4; cr1 = 2;
    } else {
      bed1 = 5; cr1 = 3;
    }
    return {
      bedrooms1F: bed1,
      crs1F: cr1,
      bedrooms2F: 0,
      crs2F: 0,
    };
  }
}

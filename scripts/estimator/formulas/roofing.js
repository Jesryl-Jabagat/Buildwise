/* ============================================================
   roofing.js — All 7 roof type calculations
   ============================================================ */

export function calcRoofing(length, width, roofType, isLightweight = false, wallingType = "") {
  const rt = String(roofType || "").toLowerCase();

  let res = {
    ridgeCaps: 0,
    cPurlins: 0,
    cocoLumber: 0,
    roofSheets: 0,
    roofLM: 0,
    cement: 0,
    screenedSand: 0,
    gravel: 0
  };

  // Type 6: Concrete Flat Deck
  if (rt.includes("flat") || rt.includes("deck") || rt === "6") {
    // NO slope factor, NO overhangs
    const deckArea = length * width;
    const flatDeckVol = deckArea * 0.125;
    res.cement = flatDeckVol * 12;
    res.screenedSand = flatDeckVol * 0.5;
    res.gravel = flatDeckVol * 1.0;
    return res;
  }

  // Standard sloped roof geometry
  const roofLength = length + (2 * 0.60);
  const roofSpan = width + (2 * 0.60);
  
  const pitchFactor = isLightweight ? 1.03 : 1.05;
  const wastageFactor = isLightweight ? 1.05 : 1.10;
  
  const rafterLength = (roofSpan / 2) * pitchFactor;
  const roofArea = roofLength * roofSpan * pitchFactor;

  res.ridgeCaps = Math.ceil(roofLength / 3);
  
  if (wallingType === "amakan") {
    // Wood framing for Amakan: Rafters and Purlins out of Coco Lumber (approx 6 bd.ft. per sqm of roof)
    res.cocoLumber = Math.ceil(roofArea * 6);
  } else {
    // Metal framing
    const purlinSpacing = isLightweight ? 0.80 : 1.20; // Budget spacing for metal cladding
    const purlinRowsPerSide = Math.ceil(rafterLength / purlinSpacing);
    res.cPurlins = purlinRowsPerSide * 2 * Math.ceil(roofLength / 6);
  }

  if (rt.includes("corrugated") || rt.includes("color") || rt === "1" || rt === "3") {
    res.roofSheets = Math.ceil(roofLength / 0.80) * Math.ceil(rafterLength / 2.44) * 2 * wastageFactor;
  } else if (rt.includes("long span") || rt.includes("longspan") || rt === "2") {
    res.roofLM = Math.ceil(roofLength / 1.00) * 2 * pitchFactor * rafterLength; 
    res.roofSheets = Math.ceil(roofLength / 1.00) * 2 * pitchFactor;
  } else if (rt.includes("spandrel") || rt === "4") {
    res.roofSheets = Math.ceil(roofArea / 0.60) * wastageFactor;
  } else if (rt.includes("polycarbonate") || rt === "5") {
    res.roofSheets = Math.ceil(roofLength / 0.80) * Math.ceil(rafterLength / 2.44) * 2 * wastageFactor;
  } else if (rt.includes("stone") || rt === "7") {
    res.roofSheets = Math.ceil(roofArea / 0.50) * wastageFactor;
  } else {
    // Default fallback (Long Span)
    res.roofLM = Math.ceil(roofLength / 1.00) * 2 * pitchFactor * rafterLength;
    res.roofSheets = Math.ceil(roofLength / 1.00) * 2 * pitchFactor;
  }

  return res;
}

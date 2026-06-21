/* ============================================================
   roofing.js — All 7 roof type calculations
   ============================================================ */

export function calcRoofing(length, width, roofType) {
  // 1.3 ROOFING (Assuming Default Long Span with 0.6m overhang and 1:3 Pitch)
  const roofLength = length + (2 * 0.60);
  const roofSpan = width + (2 * 0.60);
  const rafterLength = (roofSpan / 2) / 0.9487;
  const roofArea = roofLength * roofSpan * 1.05;

  let res = {
    ridgeCaps: 0,
    cPurlins: 0,
    roofSheets: 0,
    roofLM: 0,
    cement: 0,
    screenedSand: 0,
    gravel: 0
  };

  const rt = String(roofType || "").toLowerCase();

  if (rt.includes("flat") || rt.includes("deck")) {
    const flatDeckVol = roofArea * 0.10;
    res.cement = flatDeckVol * 9;
    res.screenedSand = flatDeckVol * 0.5;
    res.gravel = flatDeckVol * 1.0;
    return res;
  }

  res.ridgeCaps = Math.ceil(roofLength / 3);
  const purlinRowsPerSide = Math.ceil(rafterLength / 1.20);
  res.cPurlins = purlinRowsPerSide * 2 * Math.ceil(roofLength / 6);

  if (rt.includes("corrugated") || rt.includes("color") || rt === "1" || rt === "3") {
    res.roofSheets = Math.ceil(roofLength / 0.80) * Math.ceil(rafterLength / 2.4) * 2 * 1.10;
  } else if (rt.includes("long span") || rt.includes("longspan") || rt === "2") {
    // Applying the user's roofSheets formula for default/long span.
    res.roofLM = Math.ceil(roofLength / 1.00) * 2 * 1.05 * rafterLength; // Keep LM for long span to be safe with pricing
    res.roofSheets = Math.ceil(roofLength / 1.00) * 2 * 1.05; // Added strict formula provided
  } else if (rt.includes("spandrel") || rt === "4") {
    res.roofSheets = Math.ceil(roofArea / 0.30);
  } else if (rt.includes("polycarbonate") || rt === "5") {
    res.roofSheets = Math.ceil(roofArea / 0.70);
  } else if (rt.includes("stone") || rt === "7") {
    res.roofSheets = Math.ceil(roofArea / 0.34);
  } else {
    res.roofLM = Math.ceil(roofLength / 1.00) * 2 * 1.05 * rafterLength;
    res.roofSheets = Math.ceil(roofLength / 1.00) * 2 * 1.05;
  }

  return res;
}

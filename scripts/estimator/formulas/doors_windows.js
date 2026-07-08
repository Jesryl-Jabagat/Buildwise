/* ============================================================
   doors_windows.js — Doors, windows and hardware formulas
   ============================================================ */

export function calcDoorsAndWindows(numBedrooms, numCRs) {
  const beds = numBedrooms || 0;
  const crs = numCRs || 0;
  
  // 1 Main door for every house
  // +1 bedroom door per bedroom
  // +1 CR door per CR
  // +1 kitchen/back door (defaulting to bedroom door style or flush)
  
  // Windows: typically 2 windows per bedroom, 1 per CR, 2 in living room
  const bedroomWindows = beds * 2;
  const crWindows = crs * 1;
  const livingKitchenWindows = 3;
  const totalWindows = bedroomWindows + crWindows + livingKitchenWindows;
  
  // Approx linear meters of aluminum frame per window (assume 1.2 x 1.2 avg = 4.8m)
  const windowFramesLm = totalWindows * 4.8;
  // Approx sqm of glass per window (assume 1.2 x 1.2 = 1.44 sqm)
  const windowGlassSqm = totalWindows * 1.44;

  const totalDoors = 1 + beds + crs + 1; // main + beds + crs + back

  return {
    "Main Door (Solid Wood Slab)": 1,
    "Bedroom Door (Flush/Panel)": beds + 1, // bedrooms + back door
    "CR Door (PVC/Aluminum)": crs,
    "Door Jamb (Wood/Metal)": totalDoors,
    "Lockset / Doorknob": totalDoors,
    "Door Hinges (pair)": totalDoors, // usually 3 hinges = 1.5 pair, but let's say 1 heavy pair or 2 pair, round to totalDoors * 1.5
    "Window Frame (Aluminum)": windowFramesLm,
    "Window Glass Panel (sqm)": windowGlassSqm
  };
}

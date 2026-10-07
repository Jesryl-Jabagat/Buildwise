/* ============================================================
   doors_windows.js — Doors, windows and hardware formulas
   ============================================================ */

export function calcDoorsAndWindows(numBedrooms, numCRs, materialGrade = "Standard") {
  const beds = numBedrooms || 0;
  const crs = numCRs || 0;
  
  // 1 Main door for every house
  // +1 bedroom door per bedroom
  // +1 CR door per CR
  // +1 kitchen/back door (defaulting to bedroom door style or flush)
  
  // Windows: typically 1 per bedroom, 1 per CR, 2 in living room/kitchen for basic homes
  const bedroomWindows = beds * 1;
  const crWindows = crs * 1;
  const livingKitchenWindows = 2;
  const totalWindows = bedroomWindows + crWindows + livingKitchenWindows;
  
  // Approx linear meters of aluminum frame per window (assume 1.2 x 1.2 avg = 4.8m)
  const windowFramesLm = totalWindows * 4.8;
  // Approx sqm of glass per window (assume 1.2 x 1.2 = 1.44 sqm)
  const windowGlassSqm = totalWindows * 1.44;

  // 1 Main, 1 per bed, 1 per CR (Skip separate back door for standard small estimation)
  const totalDoors = 1 + beds + crs; 

  let res = {
    "Main Door (Solid Wood Slab)": 1,
    "Bedroom Door (Flush/Panel)": beds,
    "CR Door (PVC/Aluminum)": crs,
    "Door Jamb (Wood/Metal)": totalDoors,
    "Lockset / Doorknob": totalDoors,
    "Door Hinges (pair)": totalDoors, // usually 3 hinges = 1.5 pair, but let's say 1 heavy pair or 2 pair, round to totalDoors * 1.5
  };

  if (materialGrade === "Basic" || !materialGrade) {
    res["Window (Jalousie/Louvre)"] = totalWindows;
  } else {
    res["Window Frame (Aluminum)"] = windowFramesLm;
    res["Window Glass Panel (sqm)"] = windowGlassSqm;
  }
  return res;
}

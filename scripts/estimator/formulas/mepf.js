/* ============================================================
   mepf.js — Plumbing and Electrical formulas
   ============================================================ */

export function calcPlumbing(numCRs, numKitchens) {
  const crCount = numCRs || 0;
  const kitCount = numKitchens || 1; // Assuming 1 kitchen by default
  const totalWetRooms = crCount + kitCount;
  
  if (totalWetRooms === 0) return {};

  return {
    "PVC Orange Pipes 4\" (Sanitary)": crCount * 3, // 3 pipes per CR for toilet line
    "PVC Orange Pipes 2\" (Drainage)": totalWetRooms * 4, // 4 pipes per wet room for drains
    "PPR Pipes 1/2\" (Water Supply)": totalWetRooms * 6,
    "Sanitary Fittings (Orange)": totalWetRooms * 15,
    "Water Supply Fittings (PPR)": totalWetRooms * 20,
    "Water Closet (Standard flush)": crCount,
    "Lavatory (Wall-hung/Pedestal)": crCount,
    "Kitchen Sink (Stainless)": kitCount,
    "Shower Set (Head & Valve)": crCount,
    "Faucets & Angle Valves": (crCount * 3) + (kitCount * 2), // lavatory, shower, bidet/toilet + kitchen
    "Floor Drain (4x4 Stainless)": crCount,
    "Septic Tank Components (CHB/Cement)": 1 // 1 septic tank per house
  };
}

export function calcElectrical(floorArea, numBedrooms, numCRs) {
  // Rough estimate based on area and rooms
  const rooms = (numBedrooms || 0) + (numCRs || 0) + 2; // +2 for Living and Kitchen
  
  const lightingWiresBox = Math.ceil(floorArea / 50); // 1 box per 50sqm
  const outletWiresBox = Math.ceil(floorArea / 40); // 1 box per 40sqm
  const acWiresBox = Math.max(1, Math.ceil((numBedrooms || 1) / 3)); // 1 box per 3 AC units

  const conduits = Math.ceil(floorArea / 3); // ~1 conduit per 3sqm
  const flexibleHose = Math.ceil(floorArea / 20); // 1 roll per 20sqm
  
  const switches = rooms * 2;
  const outlets = rooms * 3;
  const lights = rooms * 2 + 2; // +2 for exterior

  return {
    "PVC Electrical Conduit 1/2\"": conduits,
    "Flexible Hose 1/2\" (50m)": flexibleHose,
    "PVC Fittings & Boxes": conduits * 2,
    "THHN Wire 2.0mm² (Lighting)": lightingWiresBox,
    "THHN Wire 3.5mm² (Outlets)": outletWiresBox,
    "THHN Wire 5.5mm² (AC/Heater)": acWiresBox,
    "Switches (1-3 gang)": switches,
    "Outlets (2-gang CO)": outlets,
    "Lighting (LED/Pinlights)": lights,
    "Panel Board & Circuit Breakers": 1
  };
}

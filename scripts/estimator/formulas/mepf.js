/* ============================================================
   mepf.js — Plumbing and Electrical formulas
   ============================================================ */

export function calcPlumbing(numCRs, numKitchens) {
  const crCount = numCRs || 0;
  const kitCount = 1; // Kitchen scope is strictly 1 per house
  const totalWetRooms = crCount + kitCount;
  
  if (totalWetRooms === 0) return {};

  return {
    "PVC Orange Pipes 4\" (Sanitary)": crCount * 2,         // 2 pipes per CR
    "PVC Orange Pipes 2\" (Drainage)": totalWetRooms * 3,   // 3 pipes per wet room
    "PPR Pipes 1/2\" (Water Supply)":  totalWetRooms * 4,   // 4 pipes per wet room
    "Sanitary Fittings (Orange)":      totalWetRooms * 5,   // Reduced from 8
    "Water Supply Fittings (PPR)":     totalWetRooms * 8,   // Reduced from 12
    "Water Closet (Standard flush)":   crCount,
    "Lavatory (Wall-hung/Pedestal)":   crCount,
    "Kitchen Sink (Stainless)":        kitCount,
    "Faucets & Angle Valves":          (crCount * 2) + kitCount, // 2 per CR (lavatory, bidet/toilet) + 1 kitchen
    "Floor Drain (4x4 Stainless)":     crCount
    // Septic tank and shower sets are explicitly excluded to reduce costs
  };
}

export function calcElectrical(floorArea, numBedrooms, numCRs, includeACwiring = false) {
  // Rough estimate based on area and rooms
  const rooms = (numBedrooms || 0) + (numCRs || 0) + 2; // +2 for Living and Kitchen
  
  const lightingWiresBox = Math.ceil(floorArea / 100) || 1; // 1 box per 100sqm (usually plenty for small houses)
  const outletWiresBox = Math.ceil(floorArea / 80) || 1; 
  const acWiresBox = includeACwiring ? Math.max(1, Math.ceil((numBedrooms || 1) / 3)) : 0;

  const conduits = Math.ceil(floorArea / 10); 
  const flexibleHose = Math.max(1, Math.ceil(floorArea / 100)); // less flexible hose needed usually
  
  const switches = rooms * 1.5;
  const outlets = rooms * 2;
  const lights = rooms * 1.5 + 1; // +1 for exterior

  return {
    "PVC Electrical Conduit 1/2\"": Math.max(2, conduits),
    "Flexible Hose 1/2\" (50m)": flexibleHose,
    "PVC Fittings & Boxes": Math.max(5, Math.ceil(conduits * 1.5)),
    "THHN Wire 2.0mm² (Lighting)": lightingWiresBox,
    "THHN Wire 3.5mm² (Outlets)": outletWiresBox,
    "THHN Wire 5.5mm² (AC/Heater)": acWiresBox,
    "Switches (1-3 gang)": Math.ceil(switches),
    "Outlets (2-gang CO)": Math.ceil(outlets),
    "Lighting (LED/Pinlights)": Math.ceil(lights),
    "Panel Board & Circuit Breakers": 1
  };
}

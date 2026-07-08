// scripts/estimator/prices.js

export const GRADE_MULTIPLIERS = {
  Basic: 0.85,
  Standard: 1.00,
  Premium: 1.20,
};

export const PRICES = {
  // Structural / Masonry
  "CHB 4-inch": { unit: "pcs", price: 19.50 },
  "Cement (Mortar 40kg)": { unit: "bags", price: 205 },
  "Cement (Plastering 40kg)": { unit: "bags", price: 235 },
  "White Cement (Tile Grout)": { unit: "kg", price: 27.50 },
  "Screened Sand": { unit: "cu.m.", price: 1050 },
  "Fine Sand": { unit: "cu.m.", price: 1175 },
  "3/4 Gravel": { unit: "cu.m.", price: 1200 },
  "16mm Deformed Bar (6m)": { unit: "lengths", price: 360 },
  "12mm Deformed Bar (6m)": { unit: "lengths", price: 215 },
  "10mm Deformed Bar (6m)": { unit: "lengths", price: 143 },
  "G.I. Tie Wire #16": { unit: "kg", price: 74 },
  "Phenolic Board 3/4\"": { unit: "sheet", price: 1190 },
  "Coco Lumber": { unit: "bd.ft.", price: 35 }, // Added standard estimate for coco lumber from stairs part

  // Walling / Light Framing
  "Amakan Sheet (4x8 ft)": { unit: "sheet", price: 200 },
  "Metal Cladding Sheet": { unit: "sheet", price: 735 },
  "Rectangular Steel Tube 2x3x1.5mm (6m)": { unit: "pcs", price: 628 },
  "Fiber Cement Board / Hardiflex": { unit: "sheet", price: 1012 },
  "Gypsum Board": { unit: "sheet", price: 250 },
  "PVC Board": { unit: "sheet", price: 1750 },
  "Marine Plywood": { unit: "sheet", price: 786 },
  "Standard Plywood": { unit: "sheet", price: 747 },

  // Roofing
  "Corrugated GI Sheet / Yero": { unit: "kilo", price: 195 },
  "Long Span Pre-Painted": { unit: "lm", price: 344 },
  "Color Roof Corrugated": { unit: "sheet", price: 946 },
  "Spandrel Panel (PVC)": { unit: "pcs", price: 268 },
  "Polycarbonate Sheet": { unit: "sheet", price: 1875 },
  "Metal Stone-Coated Tile": { unit: "pcs", price: 1496 },
  "C-Purlin 75x50x15x2mm (6m)": { unit: "pcs", price: 570 },
  "C-Purlin 100x50x15x2mm (6m)": { unit: "pcs", price: 650 },
  "Ridge Roll / Ridge Cap": { unit: "pcs", price: 150 },
  "Gutter / Eave Flashing (8ft)": { unit: "pcs", price: 422 },
  "Tekscrew (EPDM washer)": { unit: "pcs", price: 4.75 },
  "Rubber Washer (EPDM)": { unit: "pcs", price: 3.00 },
  "Silicone Sealant": { unit: "tube", price: 117 },
  "Roofing Screw": { unit: "pcs", price: 7.00 },

  // Finishes
  "Floor Tile - Small (7.5-15cm)": { unit: "pcs", price: 65 },
  "Floor Tile - Medium (20-30cm)": { unit: "pcs", price: 100 },
  "Floor Tile - Large (30-60 / 60x60)": { unit: "pcs", price: 159 },
  "Tile Adhesive (25kg bag)": { unit: "bags", price: 340 },
  "Concrete Primer": { unit: "gal", price: 450 },
  "Concrete Putty": { unit: "gal", price: 350 },
  "Architectural Topcoat Paint": { unit: "gal", price: 700 },

  // Ceiling
  "Ceiling Board 3x6 Gypsum": { unit: "sheet", price: 250 },
  "Fiber Cement Board (ceiling)": { unit: "sheet", price: 1012 },
  "PVC Board (ceiling)": { unit: "sheet", price: 1750 },
  "Wall Angle (3m)": { unit: "pcs", price: 65 },
  "Main Channel / Carrying Channel (3m)": { unit: "pcs", price: 92 },
  "Furring (3m)": { unit: "pcs", price: 55 },
  "Blind Rivets (box)": { unit: "box", price: 250 },
  "Foil Insulation (roll)": { unit: "roll", price: 1200 },
  
  // Handrail and newel post
  "Handrail": { unit: "lm", price: 450 },
  "Newel Post": { unit: "pcs", price: 1500 },

  // Structural Earthworks & Support
  "Excavation / Backfill": { unit: "cu.m.", price: 350 },
  "Soil Poisoning / Termite Treatment": { unit: "sq.m.", price: 150 },
  "Formworks (Plywood & Lumber)": { unit: "sq.m.", price: 450 },
  "Tie Wire #16": { unit: "kg", price: 75 },

  // Doors & Windows
  "Main Door (Solid Wood Slab)": { unit: "set", price: 4500 },
  "Bedroom Door (Flush/Panel)": { unit: "set", price: 2500 },
  "CR Door (PVC/Aluminum)": { unit: "set", price: 1800 },
  "Door Jamb (Wood/Metal)": { unit: "set", price: 1200 },
  "Lockset / Doorknob": { unit: "set", price: 650 },
  "Door Hinges (pair)": { unit: "pair", price: 150 },
  "Window Frame (Aluminum)": { unit: "lm", price: 350 },
  "Window Glass Panel (sqm)": { unit: "sq.m.", price: 800 },

  // Painting Accessories
  "Paint Brush / Roller set": { unit: "set", price: 350 },
  "Paint Thinner": { unit: "gal", price: 280 },
  "Sandpaper / Masking Tape": { unit: "lot", price: 500 },

  // Plumbing Materials
  "PVC Orange Pipes 4\" (Sanitary)": { unit: "pcs", price: 350 },
  "PVC Orange Pipes 2\" (Drainage)": { unit: "pcs", price: 150 },
  "PPR Pipes 1/2\" (Water Supply)": { unit: "pcs", price: 180 },
  "Sanitary Fittings (Orange)": { unit: "pcs", price: 40 },
  "Water Supply Fittings (PPR)": { unit: "pcs", price: 30 },
  "PVC Solvent / Teflon Tape": { unit: "lot", price: 150 },
  "Water Closet (Standard flush)": { unit: "set", price: 4500 },
  "Lavatory (Wall-hung/Pedestal)": { unit: "set", price: 2200 },
  "Kitchen Sink (Stainless)": { unit: "set", price: 1800 },
  "Shower Set (Head & Valve)": { unit: "set", price: 1200 },
  "Faucets & Angle Valves": { unit: "pcs", price: 350 },
  "Floor Drain (4x4 Stainless)": { unit: "pcs", price: 150 },
  "Septic Tank Components (CHB/Cement)": { unit: "lot", price: 8500 },

  // Electrical Materials
  "PVC Electrical Conduit 1/2\"": { unit: "pcs", price: 75 },
  "Flexible Hose 1/2\" (50m)": { unit: "roll", price: 400 },
  "PVC Fittings & Boxes": { unit: "pcs", price: 25 },
  "THHN Wire 2.0mm² (Lighting)": { unit: "box", price: 3200 },
  "THHN Wire 3.5mm² (Outlets)": { unit: "box", price: 5000 },
  "THHN Wire 5.5mm² (AC/Heater)": { unit: "box", price: 6500 },
  "Switches (1-3 gang)": { unit: "set", price: 250 },
  "Outlets (2-gang CO)": { unit: "set", price: 250 },
  "Lighting (LED/Pinlights)": { unit: "pcs", price: 200 },
  "Panel Board & Circuit Breakers": { unit: "set", price: 2500 },
  "Electrical Tape": { unit: "roll", price: 50 }
};

export function getPrice(materialName, grade = "Standard") {
  let baseName = materialName;
  if (materialName.startsWith("Architectural Topcoat Paint")) {
    baseName = "Architectural Topcoat Paint";
  }
  const item = PRICES[baseName];
  if (!item) {
    console.warn(`Price not found for material: ${baseName}`);
    return 0;
  }
  const multiplier = GRADE_MULTIPLIERS[grade] || 1.0;
  return item.price * multiplier;
}

export function formatMaterialCost(name, qty, grade = "Standard") {
  let baseName = name;
  if (name.startsWith("Architectural Topcoat Paint")) {
    baseName = "Architectural Topcoat Paint";
  }
  const item = PRICES[baseName] || { unit: "unit", price: 0 };
  const unitCost = getPrice(name, grade); // getPrice uses baseName internally now
  const total = qty * unitCost;
  return {
    name,
    qty,
    unit: item.unit,
    unitCost,
    total
  };
}

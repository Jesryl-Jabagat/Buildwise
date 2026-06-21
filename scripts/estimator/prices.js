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
  "Architectural Topcoat Paint": { unit: "gal", price: 700 },

  // Ceiling
  "Ceiling Board 3x6 Gypsum": { unit: "sheet", price: 250 },
  "Fiber Cement Board (ceiling)": { unit: "sheet", price: 1012 },
  "PVC Board (ceiling)": { unit: "sheet", price: 1750 },
  "Wall Angle (3m)": { unit: "pcs", price: 65 },
  "Main Channel / Carrying Channel (3m)": { unit: "pcs", price: 92 },
  "Furring (3m)": { unit: "pcs", price: 55 },
  
  // Handrail and newel post
  "Handrail": { unit: "lm", price: 450 }, // Approximation since omitted from price list but exists in CR/stairs
  "Newel Post": { unit: "pcs", price: 1500 }, // Approximation since omitted from price list but exists in CR/stairs
};

export function getPrice(materialName, grade = "Standard") {
  const item = PRICES[materialName];
  if (!item) {
    console.warn(`Price not found for material: ${materialName}`);
    return 0;
  }
  const multiplier = GRADE_MULTIPLIERS[grade] || 1.0;
  return item.price * multiplier;
}

export function formatMaterialCost(name, qty, grade = "Standard") {
  const item = PRICES[name] || { unit: "unit", price: 0 };
  const unitCost = getPrice(name, grade);
  const total = qty * unitCost;
  return {
    name,
    qty,
    unit: item.unit,
    unitCost,
    total
  };
}

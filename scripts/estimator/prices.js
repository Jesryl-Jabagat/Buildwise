// scripts/estimator/prices.js

/**
 * DEFAULT TIER CATALOG
 * Fallback baseline for all materials with dedicated brands and prices across tiers.
 * No more static multipliers (1x, 1.5x, 2x).
 */
export const DEFAULT_TIER_CATALOG = {
  // Structural / Masonry
  "CHB 4-inch": {
    unit: "pcs",
    category: "Foundation & Structure",
    Basic: { brand: "Local Unbranded Hollow Block", price: 17.50 },
    Standard: { brand: "Standard Machine-Pressed CHB", price: 19.50 },
    Premium: { brand: "High-Strength Load-Bearing Vibro CHB", price: 24.00 }
  },
  "Cement (Mortar 40kg)": {
    unit: "bags",
    category: "Foundation & Structure",
    Basic: { brand: "Generic Masonry Cement", price: 215.00 },
    Standard: { brand: "Apo / Eagle Portland Cement", price: 235.00 },
    Premium: { brand: "Holcim Excel / Republic Type 1P", price: 255.00 }
  },
  "Cement (Plastering 40kg)": {
    unit: "bags",
    category: "Foundation & Structure",
    Basic: { brand: "Generic Pozzolan Cement", price: 210.00 },
    Standard: { brand: "Apo Pozzolan Cement", price: 235.00 },
    Premium: { brand: "Holcim WallRight Finishing Cement", price: 260.00 }
  },
  "White Cement (Tile Grout)": {
    unit: "kg",
    category: "Finishes",
    Basic: { brand: "Generic White Cement", price: 22.00 },
    Standard: { brand: "ABC Tile Grout White", price: 28.00 },
    Premium: { brand: "Davco / Bostik Anti-Fungal Tile Grout", price: 42.00 }
  },
  "Screened Sand": {
    unit: "cu.m.",
    category: "Foundation & Structure",
    Basic: { brand: "Local Quarry Screened Sand", price: 950.00 },
    Standard: { brand: "Standard Fine River Sand", price: 1050.00 },
    Premium: { brand: "Washed Sieve-Graded Concrete Sand", price: 1300.00 }
  },
  "Fine Sand": {
    unit: "cu.m.",
    category: "Foundation & Structure",
    Basic: { brand: "Local Screened Quarry Sand", price: 1050.00 },
    Standard: { brand: "Standard Washed Plaster Sand", price: 1175.00 },
    Premium: { brand: "Double-Washed Vibro Fine Sand", price: 1450.00 }
  },
  "3/4 Gravel": {
    unit: "cu.m.",
    category: "Foundation & Structure",
    Basic: { brand: "Crushed Andesite Base Gravel", price: 1100.00 },
    Standard: { brand: "Standard 3/4\" Blue Gravel", price: 1200.00 },
    Premium: { brand: "Washed Crushed Granite 3/4\" Gravel", price: 1500.00 }
  },
  "16mm Deformed Bar (6m)": {
    unit: "lengths",
    category: "Foundation & Structure",
    Basic: { brand: "Commercial Rebar (Bended/Reroll)", price: 315.00 },
    Standard: { brand: "SteelAsia Grade 33 Deformed Bar", price: 360.00 },
    Premium: { brand: "Pag-asa Steel Grade 40 Deformed Bar", price: 410.00 }
  },
  "12mm Deformed Bar (6m)": {
    unit: "lengths",
    category: "Foundation & Structure",
    Basic: { brand: "Commercial Rebar (Grade 30)", price: 185.00 },
    Standard: { brand: "SteelAsia Grade 33 Deformed Bar", price: 215.00 },
    Premium: { brand: "Pag-asa Steel Grade 40 High-Tensile", price: 250.00 }
  },
  "10mm Deformed Bar (6m)": {
    unit: "lengths",
    category: "Foundation & Structure",
    Basic: { brand: "Commercial Grade 30 Bar", price: 125.00 },
    Standard: { brand: "SteelAsia Grade 33 Rebar", price: 143.00 },
    Premium: { brand: "Pag-asa Steel Grade 40 Deformed Bar", price: 170.00 }
  },
  "G.I. Tie Wire #16": {
    unit: "kg",
    category: "Foundation & Structure",
    Basic: { brand: "Standard Galvanized Tie Wire", price: 65.00 },
    Standard: { brand: "Bright Carbon Steel #16 Tie Wire", price: 74.00 },
    Premium: { brand: "Heavy-Duty Annealed Rust-Proof Tie Wire", price: 90.00 }
  },
  "Phenolic Board 3/4\"": {
    unit: "sheet",
    category: "Foundation & Structure",
    Basic: { brand: "Single-Film Black Plywood Form", price: 950.00 },
    Standard: { brand: "Crown / Lion Double-Film Phenolic Board", price: 1190.00 },
    Premium: { brand: "Birch-Core Marine Heavy-Use Phenolic", price: 1550.00 }
  },
  "Coco Lumber": {
    unit: "bd.ft.",
    category: "Foundation & Structure",
    Basic: { brand: "Rough Cut Green Coco Lumber", price: 30.00 },
    Standard: { brand: "Semi-Seasoned Straight Coco Lumber", price: 35.00 },
    Premium: { brand: "Kiln-Dried Treated Coco / Good Lumber", price: 45.00 }
  },

  // Walling & Light Framing
  "Amakan Sheet (4x8 ft)": {
    unit: "sheet",
    category: "Walling",
    Basic: { brand: "Ordinary Split-Bamboo Amakan", price: 160.00 },
    Standard: { brand: "Standard Woven Bamboo Weave", price: 200.00 },
    Premium: { brand: "Double-Layer Treated Varathane Amakan", price: 270.00 }
  },
  "Metal Cladding Sheet": {
    unit: "sheet",
    category: "Walling",
    Basic: { brand: "Unpainted Spandrel Fluted Sheet", price: 580.00 },
    Standard: { brand: "ColorSteel Spandrel Metal Cladding", price: 735.00 },
    Premium: { brand: "Stone-Textured Polyurethane Foam Cladding", price: 990.00 }
  },
  "Rectangular Steel Tube 2x3x1.5mm (6m)": {
    unit: "pcs",
    category: "Walling",
    Basic: { brand: "Black Iron (BI) Rectangular Tube", price: 520.00 },
    Standard: { brand: "Pre-Galvanized Rect Tube 1.5mm", price: 628.00 },
    Premium: { brand: "Hot-Dip Galvanized Structural Rect Tube", price: 780.00 }
  },
  "Fiber Cement Board / Hardiflex": {
    unit: "sheet",
    category: "Walling",
    Basic: { brand: "Shera / SCG Board (3.5mm)", price: 420.00 },
    Standard: { brand: "James Hardie HardiFlex (4.5mm)", price: 560.00 },
    Premium: { brand: "James Hardie HardiFlex Senepa (6.0mm)", price: 720.00 }
  },
  "Gypsum Board": {
    unit: "sheet",
    category: "Walling",
    Basic: { brand: "Standard Gyproc Regular 9mm", price: 230.00 },
    Standard: { brand: "Boral / Knauf Standard Gypsum 9mm", price: 250.00 },
    Premium: { brand: "Knauf Moisture-Resistant (Green Board)", price: 340.00 }
  },
  "PVC Board": {
    unit: "sheet",
    category: "Walling",
    Basic: { brand: "Standard White Foam PVC Board", price: 1400.00 },
    Standard: { brand: "Waterproof Solid Rigid PVC Sheet", price: 1750.00 },
    Premium: { brand: "UV-Coated Architectural Woodgrain PVC", price: 2300.00 }
  },
  "Marine Plywood": {
    unit: "sheet",
    category: "Walling",
    Basic: { brand: "Ordinary Santa Clara Marine 1/4\"", price: 550.00 },
    Standard: { brand: "Standard Export Quality Marine 1/2\"", price: 786.00 },
    Premium: { brand: "Heavy Marine Waterproof Plywood 3/4\"", price: 1250.00 }
  },
  "Standard Plywood": {
    unit: "sheet",
    category: "Walling",
    Basic: { brand: "Ordinary Ordinary Lauan Plywood 1/4\"", price: 450.00 },
    Standard: { brand: "Standard Commercial Plywood 1/2\"", price: 747.00 },
    Premium: { brand: "Fine Sanded Hardwood Plywood 3/4\"", price: 1150.00 }
  },

  // Roofing
  "Corrugated GI Sheet / Yero": {
    unit: "sheet",
    category: "Roofing",
    Basic: { brand: "Ordinary Commercial 0.30mm GI Sheet", price: 220.00 },
    Standard: { brand: "ColorSteel Corrugated 0.40mm Yero", price: 290.00 },
    Premium: { brand: "Union Galvasteel 0.50mm Duratile Yero", price: 380.00 }
  },
  "Long Span Pre-Painted": {
    unit: "lm",
    category: "Roofing",
    Basic: { brand: "DN Steel 0.35mm Pre-painted Rib-Type", price: 280.00 },
    Standard: { brand: "Union Galvasteel 0.40mm Custom Long-Span", price: 344.00 },
    Premium: { brand: "ColorSteel 0.50mm Heavy-Rib Industrial Span", price: 440.00 }
  },
  "Color Roof Corrugated": {
    unit: "sheet",
    category: "Roofing",
    Basic: { brand: "Commercial Pre-Painted Corrugated (8ft)", price: 380.00 },
    Standard: { brand: "DN Steel Rib-Corrugated Color Roof", price: 460.00 },
    Premium: { brand: "Union Galvasteel Heavy-Zinc Rib-Roof", price: 580.00 }
  },
  "Spandrel Panel (PVC)": {
    unit: "pcs",
    category: "Roofing",
    Basic: { brand: "Economy White PVC Spandrel", price: 220.00 },
    Standard: { brand: "Standard Perforated Ventilation Spandrel", price: 268.00 },
    Premium: { brand: "Wood-Grain Embossed Aluminum Spandrel", price: 390.00 }
  },
  "Polycarbonate Sheet": {
    unit: "sheet",
    category: "Roofing",
    Basic: { brand: "Hollow Sunsheet Polycarbonate", price: 1400.00 },
    Standard: { brand: "Twin-Wall UV-Protected Polycarbonate", price: 1875.00 },
    Premium: { brand: "Solid Embossed High-Impact Polycarbonate", price: 2600.00 }
  },
  "Metal Stone-Coated Tile": {
    unit: "pcs",
    category: "Roofing",
    Basic: { brand: "Economy Acrylic Stone Tile", price: 380.00 },
    Standard: { brand: "Decra / Tilcor Stone-Coated Classic", price: 460.00 },
    Premium: { brand: "Gerard Milano Stone-Coated Steel Tile", price: 620.00 }
  },
  "C-Purlin 75x50x15x2mm (6m)": {
    unit: "pcs",
    category: "Roofing",
    Basic: { brand: "Commercial Black Iron C-Purlin 1.2mm", price: 450.00 },
    Standard: { brand: "Pre-Galvanized Light Gauge C-Purlin 1.5mm", price: 570.00 },
    Premium: { brand: "Heavy Galvanized High-Yield C-Purlin 2.0mm", price: 710.00 }
  },
  "C-Purlin 100x50x15x2mm (6m)": {
    unit: "pcs",
    category: "Roofing",
    Basic: { brand: "Commercial BI C-Purlin 100mm 1.5mm", price: 540.00 },
    Standard: { brand: "Galvanized 100x50x2mm C-Purlin", price: 650.00 },
    Premium: { brand: "Heavy-Duty Structural C-Channel 100mm", price: 820.00 }
  },
  "Ridge Roll / Ridge Cap": {
    unit: "pcs",
    category: "Roofing",
    Basic: { brand: "Plain Ordinary Galvanized Ridge Roll (8ft)", price: 110.00 },
    Standard: { brand: "ColorSteel Pre-Painted Ridge Cap (8ft)", price: 150.00 },
    Premium: { brand: "Union Galvasteel 0.50mm Ribbed Ridge Flashing", price: 220.00 }
  },
  "Gutter / Eave Flashing (8ft)": {
    unit: "pcs",
    category: "Roofing",
    Basic: { brand: "Plain GI Spanish Gutter 8ft", price: 310.00 },
    Standard: { brand: "ColorSteel Pre-painted Box Gutter 8ft", price: 422.00 },
    Premium: { brand: "Seamless Stainless Steel / Heavy Galv Gutter", price: 650.00 }
  },
  "Tekscrew (EPDM washer)": {
    unit: "pcs",
    category: "Roofing",
    Basic: { brand: "Generic Carbon Steel Tekscrew", price: 3.50 },
    Standard: { brand: "Buildex / Apex Coated Self-Drilling Screw", price: 4.75 },
    Premium: { brand: "Ruspert Anti-Corrosion Ruspert Tekscrew", price: 7.50 }
  },
  "Rubber Washer (EPDM)": {
    unit: "pcs",
    category: "Roofing",
    Basic: { brand: "Generic Neoprene Washer", price: 2.00 },
    Standard: { brand: "High-Grade EPDM Weatherproof Washer", price: 3.00 },
    Premium: { brand: "UV-Resistant Bonded Seal Washer", price: 5.00 }
  },
  "Silicone Sealant": {
    unit: "tube",
    category: "Roofing",
    Basic: { brand: "Generic Acetic Silicone Sealant", price: 95.00 },
    Standard: { brand: "Dowsil / Pioneer Pro Roof & Gutter Neutral", price: 117.00 },
    Premium: { brand: "Sikaflex Construction Polyurethane Sealant", price: 280.00 }
  },
  "Roofing Screw": {
    unit: "pcs",
    category: "Roofing",
    Basic: { brand: "Standard Zinc Plated Screw", price: 5.00 },
    Standard: { brand: "Hardened Steel Tekscrew with Neoprene", price: 7.00 },
    Premium: { brand: "Class 4 Climaseal Heavy Roofing Screw", price: 12.00 }
  },

  // Finishes
  "Floor Tile - Small (7.5-15cm)": {
    unit: "pcs",
    category: "Finishes",
    Basic: { brand: "Local Unglazed Red Clay / Mosaic Tile", price: 45.00 },
    Standard: { brand: "Mariwasa Glazed Ceramic Subway Tile", price: 65.00 },
    Premium: { brand: "Eurotiles Anti-Slip Porcelain Mosaic", price: 95.00 }
  },
  "Floor Tile - Medium (20-30cm)": {
    unit: "pcs",
    category: "Finishes",
    Basic: { brand: "Mariwasa 30x30 Ceramic Floor Tile", price: 70.00 },
    Standard: { brand: "Floor Center 30x30 Glazed Porcelain", price: 100.00 },
    Premium: { brand: "Imported Vitrified Non-Skid Ceramic Tile", price: 145.00 }
  },
  "Floor Tile - Large (30-60 / 60x60)": {
    unit: "pcs",
    category: "Finishes",
    Basic: { brand: "Floor Center 60x60 Glazed Ceramic Tile", price: 125.00 },
    Standard: { brand: "Mariwasa / Tenzen 60x60 Polished Porcelain", price: 159.00 },
    Premium: { brand: "Imported Homogeneous Nano-Coated Porcelain", price: 240.00 }
  },
  "Tile Adhesive (25kg bag)": {
    unit: "bags",
    category: "Finishes",
    Basic: { brand: "Generic Tile Bonding Mortar", price: 260.00 },
    Standard: { brand: "ABC Heavy-Duty Tile Adhesive", price: 340.00 },
    Premium: { brand: "Bostik / Davco Flexible Polymer Adhesive", price: 480.00 }
  },
  "Concrete Primer": {
    unit: "gal",
    category: "Finishes",
    Basic: { brand: "Local Acrylic Water-based Primer", price: 360.00 },
    Standard: { brand: "Boysen Permacoat Flat Latex Primer #701", price: 450.00 },
    Premium: { brand: "Davies Megacryl Concrete Primer & Sealer", price: 560.00 }
  },
  "Concrete Putty": {
    unit: "gal",
    category: "Finishes",
    Basic: { brand: "Local Gypsum Base Patching Putty", price: 280.00 },
    Standard: { brand: "Boysen Masonry Putty #7311", price: 350.00 },
    Premium: { brand: "Davies 5000 Acrylic Putty Filler", price: 440.00 }
  },
  "Architectural Topcoat Paint": {
    unit: "gal",
    category: "Finishes",
    Basic: { brand: "Local Semi-Gloss Latex Paint", price: 520.00 },
    Standard: { brand: "Boysen Permacoat Semi-Gloss Latex", price: 700.00 },
    Premium: { brand: "Boysen Virtuoso Silk Touch / Davies Sun & Rain", price: 920.00 }
  },
  "Paint Brush / Roller set": {
    unit: "set",
    category: "Finishes",
    Basic: { brand: "Standard Wooden Handle Brush & Roller", price: 250.00 },
    Standard: { brand: "Harris / Stanley Heavy Cotton Roller & Brush", price: 350.00 },
    Premium: { brand: "Purdy Professional No-Drop Painting Kit", price: 550.00 }
  },
  "Paint Thinner": {
    unit: "gal",
    category: "Finishes",
    Basic: { brand: "Commercial Recycled Lacquer Thinner", price: 220.00 },
    Standard: { brand: "Boysen Paint Thinner #030", price: 280.00 },
    Premium: { brand: "Davies Odorless Paint Thinner", price: 380.00 }
  },
  "Sandpaper / Masking Tape": {
    unit: "lot",
    category: "Finishes",
    Basic: { brand: "Generic Brown Sandpaper & Masking Tape", price: 350.00 },
    Standard: { brand: "Deerfos Waterproof Sandpaper + 3M Tape", price: 500.00 },
    Premium: { brand: "3M Professional Sanding Sponges & Clean-Release Tape", price: 750.00 }
  },

  // Ceiling
  "Ceiling Board 3x6 Gypsum": {
    unit: "sheet",
    category: "Ceiling",
    Basic: { brand: "Standard Gypsum Board 3x6 9mm", price: 210.00 },
    Standard: { brand: "Knauf Standard Ceiling Board 9mm", price: 250.00 },
    Premium: { brand: "Knauf Cleaneo Acoustic Ceiling Sheet", price: 380.00 }
  },
  "Fiber Cement Board (ceiling)": {
    unit: "sheet",
    category: "Ceiling",
    Basic: { brand: "Shera Ceiling Board 3.5mm", price: 380.00 },
    Standard: { brand: "James Hardie HardiFlex 4.5mm", price: 560.00 },
    Premium: { brand: "James Hardie HardiFlex Moisture-Shield 6mm", price: 740.00 }
  },
  "PVC Board (ceiling)": {
    unit: "sheet",
    category: "Ceiling",
    Basic: { brand: "Standard White Ribbed PVC Ceiling Panel", price: 1200.00 },
    Standard: { brand: "Solid Color Woodgrain PVC Board", price: 1750.00 },
    Premium: { brand: "Anti-UV Embossed Architectural PVC Ceiling", price: 2400.00 }
  },
  "Wall Angle (3m)": {
    unit: "pcs",
    category: "Ceiling",
    Basic: { brand: "Economy 0.30mm Painted Wall Angle", price: 50.00 },
    Standard: { brand: "Standard 0.40mm Galvanized Wall Angle", price: 65.00 },
    Premium: { brand: "Boral Heavy 0.50mm Zinc-Coated Wall Angle", price: 90.00 }
  },
  "Main Channel / Carrying Channel (3m)": {
    unit: "pcs",
    category: "Ceiling",
    Basic: { brand: "Light Gauge 0.40mm Carrying Channel", price: 75.00 },
    Standard: { brand: "Standard 0.50mm Galvanized Main Channel", price: 92.00 },
    Premium: { brand: "Structural 0.70mm Double-Rib Carrying Channel", price: 130.00 }
  },
  "Furring (3m)": {
    unit: "pcs",
    category: "Ceiling",
    Basic: { brand: "Economy Double Furring Channel 0.35mm", price: 42.00 },
    Standard: { brand: "Standard 0.40mm Pre-Galv Double Furring", price: 55.00 },
    Premium: { brand: "Heavy 0.50mm High-Tensile Double Furring", price: 80.00 }
  },
  "Blind Rivets (box)": {
    unit: "box",
    category: "Ceiling",
    Basic: { brand: "Aluminum Blind Rivets 5/32 x 1/2", price: 190.00 },
    Standard: { brand: "Apex Carbon Steel Rivets (1000 pcs)", price: 250.00 },
    Premium: { brand: "Stainless Steel Weather-Tite Rivets", price: 420.00 }
  },
  "Foil Insulation (roll)": {
    unit: "roll",
    category: "Ceiling",
    Basic: { brand: "Single-Sided Aluminum Bubble Foil", price: 850.00 },
    Standard: { brand: "Double-Sided Radiant Thermal Barrier Foil", price: 1200.00 },
    Premium: { brand: "Cross-Linked Polyethylene (XLPE) Foam Foil 10mm", price: 1950.00 }
  },

  // Doors & Windows
  "Main Door (Solid Wood Slab)": {
    unit: "set",
    category: "Doors & Windows",
    Basic: { brand: "Semi-Solid Wood Paneled Door (Tanguile)", price: 2100.00 },
    Standard: { brand: "Solid Mahogany / Yakal Modern Carved Door", price: 2800.00 },
    Premium: { brand: "Heavy Kiln-Dried Narra Solid Pivot Door", price: 4500.00 }
  },
  "Bedroom Door (Flush/Panel)": {
    unit: "set",
    category: "Doors & Windows",
    Basic: { brand: "Hollow Core Plywood Flush Door", price: 950.00 },
    Standard: { brand: "Solid Engineered Wood Molded Panel Door", price: 1350.00 },
    Premium: { brand: "Acoustic Insulated Solid Core HDF Door", price: 2200.00 }
  },
  "CR Door (PVC/Aluminum)": {
    unit: "set",
    category: "Doors & Windows",
    Basic: { brand: "Standard White Hollow PVC Door with Louver", price: 950.00 },
    Standard: { brand: "Heavy-Duty Woodgrain PVC Door with Lock", price: 1350.00 },
    Premium: { brand: "Powder-Coated Aluminum Door with Frosted Glass", price: 2800.00 }
  },
  "Door Jamb (Wood/Metal)": {
    unit: "set",
    category: "Doors & Windows",
    Basic: { brand: "Local Machine-Cut Wooden Jamb (2x4)", price: 950.00 },
    Standard: { brand: "Treated Kiln-Dried Mahogany Door Jamb", price: 1350.00 },
    Premium: { brand: "Heavy Gauge 1.5mm Steel Wrap-Around Jamb", price: 1950.00 }
  },
  "Lockset / Doorknob": {
    unit: "set",
    category: "Doors & Windows",
    Basic: { brand: "Standard Stainless Steel Tulip Lockset", price: 420.00 },
    Standard: { brand: "Yale / Creston Cylindrical Leverset", price: 650.00 },
    Premium: { brand: "Hafele / Schlage Heavy-Duty Security Lockset", price: 1250.00 }
  },
  "Door Hinges (pair)": {
    unit: "pair",
    category: "Doors & Windows",
    Basic: { brand: "Standard Iron Butt Hinges 3.5\"", price: 90.00 },
    Standard: { brand: "Stainless Steel Ball-Bearing Hinges 4x4", price: 150.00 },
    Premium: { brand: "Hafele Grade 304 Stainless Ball-Bearing Hinges", price: 290.00 }
  },
  "Window Frame (Aluminum)": {
    unit: "lm",
    category: "Doors & Windows",
    Basic: { brand: "Mill Finish Aluminum Section (Analoc)", price: 260.00 },
    Standard: { brand: "Standard White Powder-Coated 798 Aluminum", price: 350.00 },
    Premium: { brand: "Matte Black Heavy Thermal-Break Aluminum Section", price: 520.00 }
  },
  "Window Glass Panel (sqm)": {
    unit: "sq.m.",
    category: "Doors & Windows",
    Basic: { brand: "Clear Float Glass 5mm", price: 620.00 },
    Standard: { brand: "Bronze / Smoke Tinted Float Glass 6mm", price: 800.00 },
    Premium: { brand: "Tempered Double-Glazed Low-E Glass 8mm", price: 1450.00 }
  },
  "Window (Jalousie/Louvre)": {
    unit: "set",
    category: "Doors & Windows",
    Basic: { brand: "Galvanized Jalousie Frame with Clear Blades", price: 850.00 },
    Standard: { brand: "Aluminum Jalousie Frame with Frosted Blades", price: 1200.00 },
    Premium: { brand: "Heavy Aluminum Louver Casement System", price: 1850.00 }
  },

  // Handrail and stairs
  "Handrail": {
    unit: "lm",
    category: "Stairs",
    Basic: { brand: "Plain Round Wooden Handrail (Tanguile)", price: 350.00 },
    Standard: { brand: "Milled Hardwood Kamagong/Mahogany Handrail", price: 450.00 },
    Premium: { brand: "Grade 304 Stainless Steel Tubular Handrail", price: 780.00 }
  },
  "Newel Post": {
    unit: "pcs",
    category: "Stairs",
    Basic: { brand: "Simple Turned Wood Post 3x3", price: 1100.00 },
    Standard: { brand: "Carved Solid Mahogany Newel Post 4x4", price: 1500.00 },
    Premium: { brand: "Modern Architectural Stainless & Glass Baluster Post", price: 2800.00 }
  },

  // Structural Earthworks & Support
  "Excavation / Backfill": {
    unit: "cu.m.",
    category: "Foundation & Structure",
    Basic: { brand: "Manual Digging & Compacted Native Backfill", price: 300.00 },
    Standard: { brand: "Standard Trench Excavation with G-1 Fill", price: 350.00 },
    Premium: { brand: "Machine Excavation with Vibro-Compacted Base Course", price: 480.00 }
  },
  "Soil Poisoning / Termite Treatment": {
    unit: "sq.m.",
    category: "Foundation & Structure",
    Basic: { brand: "Basic Soil Barrier Treatment", price: 110.00 },
    Standard: { brand: "Standard MAPECON / Termidor Chemical Soil Barrier", price: 150.00 },
    Premium: { brand: "Biflex 5-Year Certified Comprehensive Termite Defense", price: 240.00 }
  },
  "Formworks (Plywood & Lumber)": {
    unit: "sq.m.",
    category: "Foundation & Structure",
    Basic: { brand: "Ordinary Lumber & 1/4\" Ordinary Plywood Form", price: 350.00 },
    Standard: { brand: "Rigid Coco Lumber with 1/2\" Marine Plywood Support", price: 450.00 },
    Premium: { brand: "Re-usable Steel Props & Double-Film Phenolic Form System", price: 620.00 }
  },

  // Plumbing Materials
  "PVC Orange Pipes 4\" (Sanitary)": {
    unit: "pcs",
    category: "Plumbing",
    Basic: { brand: "Local Emerald PVC Pipe Series 600", price: 290.00 },
    Standard: { brand: "Neltex / Atlanta Saniguard Series 1000", price: 350.00 },
    Premium: { brand: "Neltex Heavy Heavy-Duty Series 1000 Thick Wall", price: 480.00 }
  },
  "PVC Orange Pipes 2\" (Drainage)": {
    unit: "pcs",
    category: "Plumbing",
    Basic: { brand: "Emerald / Crown PVC 2\" Drain Pipe", price: 120.00 },
    Standard: { brand: "Neltex / Atlanta Series 1000 2\" Pipe", price: 150.00 },
    Premium: { brand: "Neltex Saniguard 2\" Heavy Industrial Pipe", price: 220.00 }
  },
  "PPR Pipes 1/2\" (Water Supply)": {
    unit: "pcs",
    category: "Plumbing",
    Basic: { brand: "Standard PN16 PPR Cold Pipe", price: 140.00 },
    Standard: { brand: "Atlanta / Neltex PN20 Hot & Cold PPR Pipe", price: 180.00 },
    Premium: { brand: "Aquatherm Greenpipe German Certified PPR", price: 290.00 }
  },
  "Sanitary Fittings (Orange)": {
    unit: "pcs",
    category: "Plumbing",
    Basic: { brand: "Emerald Standard PVC Sanitary Fittings", price: 32.00 },
    Standard: { brand: "Neltex Saniguard Molded Fittings", price: 40.00 },
    Premium: { brand: "Neltex Heavy Radius Sweep High-Flow Fittings", price: 65.00 }
  },
  "Water Supply Fittings (PPR)": {
    unit: "pcs",
    category: "Plumbing",
    Basic: { brand: "Standard PPR Socket/Elbow Fittings", price: 22.00 },
    Standard: { brand: "Brass-Threaded Neltex PPR Transition Fittings", price: 30.00 },
    Premium: { brand: "Heavy Solid Brass Core High-Pressure PPR Fittings", price: 55.00 }
  },
  "PVC Solvent / Teflon Tape": {
    unit: "lot",
    category: "Plumbing",
    Basic: { brand: "Standard Blue Solvent Cement & Teflon", price: 110.00 },
    Standard: { brand: "Neltex High-Viscosity Pipe Cement + Heavy Teflon", price: 150.00 },
    Premium: { brand: "Oatey Heavy-Duty Industrial PVC Primer & Cement Set", price: 260.00 }
  },
  "Water Closet (Standard flush)": {
    unit: "set",
    category: "Plumbing",
    Basic: { brand: "Ordinary Dual-Flush Ceramic Toilet Set", price: 3500.00 },
    Standard: { brand: "HCG / Pozzi Water-Saving Siphonic Water Closet", price: 4500.00 },
    Premium: { brand: "American Standard / Kohler One-Piece Quiet Flush Toilet", price: 7800.00 }
  },
  "Lavatory (Wall-hung/Pedestal)": {
    unit: "set",
    category: "Plumbing",
    Basic: { brand: "Local Wall-Hung Ceramic Basin", price: 1600.00 },
    Standard: { brand: "HCG Wall-Hung Basin with Half Pedestal", price: 2200.00 },
    Premium: { brand: "American Standard Vessel Basin with Granite Countertop", price: 4200.00 }
  },
  "Kitchen Sink (Stainless)": {
    unit: "set",
    category: "Plumbing",
    Basic: { brand: "Single Bowl Stainless Steel Sink (Thin gauge)", price: 1200.00 },
    Standard: { brand: "Hafele / Pozzi Single Bowl 304 Stainless Sink", price: 1800.00 },
    Premium: { brand: "Franke Double Deep-Bowl 304 Stainless Kitchen Sink", price: 3600.00 }
  },
  "Shower Set (Head & Valve)": {
    unit: "set",
    category: "Plumbing",
    Basic: { brand: "Standard Chrome Handheld Shower with Valve", price: 850.00 },
    Standard: { brand: "Pozzi / HCG Rain Shower Head & Concealed Valve", price: 1200.00 },
    Premium: { brand: "Grohe / Kohler Thermostatic Rain Shower System", price: 3200.00 }
  },
  "Faucets & Angle Valves": {
    unit: "pcs",
    category: "Plumbing",
    Basic: { brand: "Zinc-Alloy Chrome Quarter-Turn Faucets", price: 250.00 },
    Standard: { brand: "Solid Brass HCG / Pozzi Ceramic Disk Faucet", price: 350.00 },
    Premium: { brand: "Grohe Stainless Steel Brushed Nickel Faucet", price: 850.00 }
  },
  "Floor Drain (4x4 Stainless)": {
    unit: "pcs",
    category: "Plumbing",
    Basic: { brand: "Standard 4x4 Stamped Stainless Strainer", price: 95.00 },
    Standard: { brand: "Anti-Odor Anti-Cockroach Magnetic Floor Drain", price: 150.00 },
    Premium: { brand: "Hafele Tile-Insert Invisible Stainless Floor Waste", price: 380.00 }
  },
  "Septic Tank Components (CHB/Cement)": {
    unit: "lot",
    category: "Plumbing",
    Basic: { brand: "2-Chamber Traditional CHB Digestion Tank", price: 6500.00 },
    Standard: { brand: "3-Chamber Sealed Digestive System with Baffle", price: 8500.00 },
    Premium: { brand: "Eco-Tank Prefab Polyethylene Biological Septic Chamber", price: 14500.00 }
  },

  // Electrical Materials
  "PVC Electrical Conduit 1/2\"": {
    unit: "pcs",
    category: "Electrical",
    Basic: { brand: "Crown / Emerald Thin-Wall PVC Conduit Pipe", price: 58.00 },
    Standard: { brand: "Neltex / Atlanta Thick-Wall Rigid Electrical Conduit", price: 75.00 },
    Premium: { brand: "Phelps Dodge UL-Listed Heavy Rigid Conduit Pipe", price: 110.00 }
  },
  "Flexible Hose 1/2\" (50m)": {
    unit: "roll",
    category: "Electrical",
    Basic: { brand: "Standard Orange Flexible Corrugated Tube (50m)", price: 320.00 },
    Standard: { brand: "Neltex Heavy-Duty Flexible Electrical Conduit (50m)", price: 400.00 },
    Premium: { brand: "Liquid-Tight Metallic Flexible Conduit (50m)", price: 780.00 }
  },
  "PVC Fittings & Boxes": {
    unit: "pcs",
    category: "Electrical",
    Basic: { brand: "Standard Utility & Octagonal PVC Boxes", price: 18.00 },
    Standard: { brand: "Royu / Omni Deep Flame-Retardant PVC Boxes", price: 25.00 },
    Premium: { brand: "Panasonic Heavy Rigid PVC Junction & Pull Boxes", price: 45.00 }
  },
  "THHN Wire 2.0mm² (Lighting)": {
    unit: "box",
    category: "Electrical",
    Basic: { brand: "Philflex / Columbia Pure Copper THHN (150m)", price: 2800.00 },
    Standard: { brand: "Royu / Phelps Dodge Lead-Free THHN Wire 2.0mm² (150m)", price: 3200.00 },
    Premium: { brand: "Phelps Dodge Moisture & Heat Resistant Dual-Coated (150m)", price: 3950.00 }
  },
  "THHN Wire 3.5mm² (Outlets)": {
    unit: "box",
    category: "Electrical",
    Basic: { brand: "Philflex / Columbia Pure Copper THHN 3.5mm² (150m)", price: 4400.00 },
    Standard: { brand: "Royu / Phelps Dodge Lead-Free THHN Wire 3.5mm² (150m)", price: 5000.00 },
    Premium: { brand: "Phelps Dodge Dual-Coated High-Conductivity 3.5mm² (150m)", price: 6200.00 }
  },
  "THHN Wire 5.5mm² (AC/Heater)": {
    unit: "box",
    category: "Electrical",
    Basic: { brand: "Philflex Pure Copper Wire 5.5mm² (150m)", price: 5800.00 },
    Standard: { brand: "Royu / Phelps Dodge Lead-Free Wire 5.5mm² (150m)", price: 6500.00 },
    Premium: { brand: "Phelps Dodge Premium High-Current Feeder Wire 5.5mm² (150m)", price: 7900.00 }
  },
  "Switches (1-3 gang)": {
    unit: "set",
    category: "Electrical",
    Basic: { brand: "Standard Royu Wide-Series Wall Switch Set", price: 190.00 },
    Standard: { brand: "Omni / Royu Modern Matte Wall Switch Set", price: 250.00 },
    Premium: { brand: "Panasonic Wide-Series Quick-Click Luxury Switch", price: 450.00 }
  },
  "Outlets (2-gang CO)": {
    unit: "set",
    category: "Electrical",
    Basic: { brand: "Standard Royu Grounded Convenience Outlet Set", price: 190.00 },
    Standard: { brand: "Omni Duplex Universal Outlet with Ground", price: 250.00 },
    Premium: { brand: "Panasonic Full-Color Grounded Universal Receptacle", price: 480.00 }
  },
  "Lighting (LED/Pinlights)": {
    unit: "pcs",
    category: "Electrical",
    Basic: { brand: "Standard 9W LED Surface Mount Downlight", price: 140.00 },
    Standard: { brand: "Firefly / Philips 12W Energy-Saving Recessed LED Pinlight", price: 200.00 },
    Premium: { brand: "Philips Warm Glow Dim-to-Warm Architectural Recessed Spot", price: 390.00 }
  },
  "Panel Board & Circuit Breakers": {
    unit: "set",
    category: "Electrical",
    Basic: { brand: "Standard 4-8 Branch Plug-in Distribution Panel", price: 1950.00 },
    Standard: { brand: "Royu / GE Bolt-On Enclosure with Main & Branch Breakers", price: 2500.00 },
    Premium: { brand: "Schneider Electric / Square D QO Load Center with Surge Protection", price: 4600.00 }
  },
  "Electrical Tape": {
    unit: "roll",
    category: "Electrical",
    Basic: { brand: "Standard Commercial Vinyl Electrical Tape", price: 35.00 },
    Standard: { brand: "Armak / Royu Flame-Retardant PVC Tape", price: 50.00 },
    Premium: { brand: "3M Scotch Super 33+ Heavy Professional Vinyl Tape", price: 110.00 }
  }
};

/**
 * Backward compatibility: export default prices map (uses Standard tier price by default)
 */
export const PRICES = Object.fromEntries(
  Object.entries(DEFAULT_TIER_CATALOG).map(([key, data]) => [
    key,
    { unit: data.unit, price: data.Standard.price }
  ])
);

// Cached catalog loaded from database (localStorage cache or live sync)
let cachedCatalog = null;

/**
 * Synchronizes the catalog from the Neon database (/api/materials) in the background.
 * Falls back to localStorage, then to DEFAULT_TIER_CATALOG.
 */
export async function syncMaterialsFromDb() {
  try {
    const res = await fetch("/api/materials");
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.materials) && data.materials.length > 0) {
        const dbCatalog = {};
        data.materials.forEach(item => {
          dbCatalog[item.material_key] = {
            id: item.id,
            unit: item.unit,
            category: item.category,
            Basic: {
              brand: item.basic_brand || "Basic Grade",
              price: parseFloat(item.basic_price) || 0
            },
            Standard: {
              brand: item.standard_brand || "Standard Grade",
              price: parseFloat(item.standard_price) || 0
            },
            Premium: {
              brand: item.premium_brand || "Premium Grade",
              price: parseFloat(item.premium_price) || 0
            }
          };
        });

        cachedCatalog = { ...DEFAULT_TIER_CATALOG, ...dbCatalog };
        localStorage.setItem("buildwise-materials-catalog", JSON.stringify(cachedCatalog));
        return cachedCatalog;
      }
    }
  } catch (err) {
    console.warn("Could not sync materials from /api/materials, using local cache:", err.message);
  }
  return getEffectiveCatalog();
}

/**
 * Returns the effective catalog: loaded DB cache, localStorage, or hardcoded defaults.
 */
export function getEffectiveCatalog() {
  if (cachedCatalog) return cachedCatalog;

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const local = localStorage.getItem("buildwise-materials-catalog");
      if (local) {
        cachedCatalog = { ...DEFAULT_TIER_CATALOG, ...JSON.parse(local) };
        return cachedCatalog;
      }
    }
  } catch (e) {
    console.warn("Error reading buildwise-materials-catalog from localStorage", e);
  }

  cachedCatalog = { ...DEFAULT_TIER_CATALOG };
  return cachedCatalog;
}

export function refreshCustomPrices() {
  cachedCatalog = null;
  getEffectiveCatalog();
}

// Initial load
refreshCustomPrices();

// Background sync if running in browser
if (typeof window !== "undefined" && typeof fetch === "function") {
  syncMaterialsFromDb().catch(() => {});
  window.addEventListener("storage", (e) => {
    if (e.key === "buildwise-materials-catalog" || e.key === "buildwise-custom-prices") {
      refreshCustomPrices();
    }
  });
}

/**
 * Gets exact price for a given material and tier grade.
 * Dili na mo-multiply! Direct exact tier lookup.
 */
export function getPrice(materialName, grade = "Standard") {
  let baseName = materialName;
  if (materialName.startsWith("Architectural Topcoat Paint")) {
    baseName = "Architectural Topcoat Paint";
  }

  const catalog = getEffectiveCatalog();
  const item = catalog[baseName] || DEFAULT_TIER_CATALOG[baseName];

  if (!item) {
    console.warn(`Price not found for material: ${baseName}`);
    return 0;
  }

  const normalizedGrade = (grade === "Basic" || grade === "Premium") ? grade : "Standard";
  const tierData = item[normalizedGrade] || item.Standard || { price: 0 };
  return tierData.price;
}

/**
 * Returns complete material cost including exact brand and unit price.
 */
export function formatMaterialCost(name, qty, grade = "Standard") {
  let baseName = name;
  if (name.startsWith("Architectural Topcoat Paint")) {
    baseName = "Architectural Topcoat Paint";
  }

  const catalog = getEffectiveCatalog();
  const item = catalog[baseName] || DEFAULT_TIER_CATALOG[baseName] || {
    unit: "unit",
    Standard: { brand: "", price: 0 }
  };

  const normalizedGrade = (grade === "Basic" || grade === "Premium") ? grade : "Standard";
  const tierData = item[normalizedGrade] || item.Standard || { brand: "", price: 0 };

  const unitCost = tierData.price || 0;
  const total = qty * unitCost;

  return {
    name,
    qty,
    unit: item.unit || "unit",
    unitCost,
    total,
    brand: tierData.brand || "",
    grade: normalizedGrade
  };
}

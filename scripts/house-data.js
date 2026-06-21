/* ============================================================
   house-data.js — Shared house type catalog + URL helpers
   Loaded by: configure.html, result.html
   No DOM access — pure data and URL reading only.
   ============================================================ */

/* --- House Type Catalog ------------------------------------ */

export const houseTypes = {
  "half-amakan": {
    title: "Half Amakan",
    pill: "Selected / Bungalow / Half Amakan",
    description: "Traditional amakan texture with a practical modern structural core. Ideal for ₱50k-₱80k budgets.",
    material: ["Amakan panels", "Concrete base", "Coco Lumber framing"],
    image: "../assets/house-type/amakan-style.jpeg",
    minBudget: 0
  },
  "half-metal": {
    title: "Half Metal Cladding",
    pill: "Selected / Bungalow / Half Metal",
    description: "Durable metal exterior paired with conventional bungalow framing. Ideal for ₱80k-₱120k budgets.",
    material: ["Metal cladding", "Concrete base", "Coco Lumber framing"],
    image: "../assets/house-type/metal-cladding-style.jpeg",
    minBudget: 80000
  },
  chb: {
    title: "CHB House",
    pill: "Selected / Bungalow / CHB",
    description: "Solid Concrete Hollow Block wall construction for long-term durability. Ideal for ₱120k+ budgets.",
    material: ["Concrete hollow block", "Rebar reinforcement", "Steel roof frame"],
    image: "../assets/house-type/chb-style.jpeg",
    minBudget: 120000
  },
  loft: {
    title: "Loft Style",
    pill: "Selected / Loft Style",
    description: "High ceilings, open floor plans, and modern architectural aesthetics. Ideal for ₱150k+ budgets.",
    material: ["Steel framing", "Concrete slab", "Glass frontage"],
    image: "../assets/house-type/loft-style.jpeg",
    minBudget: 150000
  },
  "two-storey": {
    title: "Two Storey",
    pill: "Selected / Two Storey",
    description: "Vertical expansion for maximum space efficiency and family zoning. Requires significant budget.",
    material: ["Reinforced concrete", "CHB walls", "Long span roofing"],
    image: "../assets/house-type/two-storey-style.jpeg",
    minBudget: 250000
  }
};

/* --- Currency Formatter ------------------------------------ */

export const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

/* --- URL Helpers ------------------------------------------- */

/**
 * Reads the "type" query param from the URL.
 * Returns the key if it is a valid houseType, otherwise "loft".
 */
export function currentTypeKey() {
  const params = new URLSearchParams(window.location.search);
  return params.get("type") && houseTypes[params.get("type")]
    ? params.get("type")
    : "loft";
}

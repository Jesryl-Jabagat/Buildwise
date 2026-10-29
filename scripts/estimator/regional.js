// scripts/estimator/regional.js

/**
 * REGIONAL_FACTORS
 * Reflects Philippine regional retail pricing differences:
 * - Material Multiplier: Hardware stores in island/mountain provinces add transport/handling into retail shelf prices.
 * - Labor Multiplier: Based on DOLE Regional Minimum Wage Orders (NCR highest, provincial lower).
 */
export const REGIONAL_FACTORS = {
  "NCR": {
    label: "National Capital Region (NCR)",
    shortLabel: "NCR",
    laborMultiplier: 1.15,      // +15% (Higher DOLE Metro Manila minimum wage)
    materialMultiplier: 1.00,   // Base 0% (Factory-direct & major port distributor pricing)
    description: "DOLE Metro Manila wage rates; factory-direct hardware pricing."
  },
  "Luzon": {
    label: "Central/South Luzon",
    shortLabel: "Central/South Luzon",
    laborMultiplier: 1.00,      // Baseline DOLE provincial wage
    materialMultiplier: 1.03,   // +3% (Regional mainland hardware retail pricing)
    description: "Standard provincial DOLE wage; regional mainland hardware pricing."
  },
  "Luzon (Typhoon Prone)": {
    label: "Northern Luzon (Typhoon Prone)",
    shortLabel: "Northern Luzon",
    laborMultiplier: 0.95,      // -5% (Provincial DOLE wage)
    materialMultiplier: 1.08,   // +8% (Northern Luzon provincial retail hardware markup)
    description: "Northern Luzon provincial DOLE rates; provincial hardware store pricing."
  },
  "Visayas": {
    label: "Central/Western Visayas",
    shortLabel: "Central/Western Visayas",
    laborMultiplier: 0.90,      // -10% (Visayas DOLE wage orders)
    materialMultiplier: 1.08,   // +8% (Visayas regional hardware retail markup)
    description: "Visayas DOLE regional wage rates; provincial hardware store pricing."
  },
  "Visayas (Typhoon Prone)": {
    label: "Eastern Visayas (Typhoon Prone)",
    shortLabel: "Eastern Visayas",
    laborMultiplier: 0.90,      // -10% (Eastern Visayas DOLE wage)
    materialMultiplier: 1.12,   // +12% (Eastern Visayas provincial retail pricing)
    description: "Eastern Visayas DOLE rates; provincial island hardware retail pricing."
  },
  "Mindanao": {
    label: "Mindanao",
    shortLabel: "Mindanao",
    laborMultiplier: 0.85,      // -15% (Mindanao DOLE regional wage orders)
    materialMultiplier: 1.12,   // +12% (Mindanao provincial retail pricing)
    description: "Mindanao regional DOLE rates; provincial hardware retail pricing."
  }
};

/**
 * Resolves location string from setup/configuration to its regional profile.
 * Handles exact matches and fuzzy/case-insensitive strings.
 */
export function getRegionalFactors(locationKey) {
  if (!locationKey) {
    return {
      label: "National Baseline",
      shortLabel: "National Baseline",
      laborMultiplier: 1.0,
      materialMultiplier: 1.0,
      description: "Standard nationwide baseline pricing."
    };
  }

  // Exact match
  if (REGIONAL_FACTORS[locationKey]) {
    return REGIONAL_FACTORS[locationKey];
  }

  // Fuzzy match
  const loc = String(locationKey).trim().toLowerCase();
  if (loc.includes("ncr") || loc.includes("manila")) return REGIONAL_FACTORS["NCR"];
  if (loc.includes("mindanao")) return REGIONAL_FACTORS["Mindanao"];
  if (loc.includes("visayas") && loc.includes("typhoon")) return REGIONAL_FACTORS["Visayas (Typhoon Prone)"];
  if (loc.includes("visayas")) return REGIONAL_FACTORS["Visayas"];
  if (loc.includes("luzon") && loc.includes("typhoon")) return REGIONAL_FACTORS["Luzon (Typhoon Prone)"];
  if (loc.includes("luzon")) return REGIONAL_FACTORS["Luzon"];

  return {
    label: locationKey,
    shortLabel: locationKey,
    laborMultiplier: 1.0,
    materialMultiplier: 1.0,
    description: "Standard nationwide baseline pricing."
  };
}

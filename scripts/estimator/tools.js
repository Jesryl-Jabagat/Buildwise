// scripts/estimator/tools.js

export const DEFAULT_TOOLS_LIST = [
  // Earthworks
  { tool_key: "Shovel (Pala)", category: "Earthworks", unit_price: 350 },
  { tool_key: "Pickaxe (Piko)", category: "Earthworks", unit_price: 450 },
  { tool_key: "Wheelbarrow (Kariton)", category: "Earthworks", unit_price: 2500 },
  
  // Carpentry
  { tool_key: "Claw Hammer", category: "Carpentry", unit_price: 250 },
  { tool_key: "Tape Measure (5m)", category: "Carpentry", unit_price: 150 },
  { tool_key: "Circular Saw", category: "Carpentry", unit_price: 3500 },
  { tool_key: "Hand Saw", category: "Carpentry", unit_price: 350 },
  { tool_key: "Carpenter Square (L-Square)", category: "Carpentry", unit_price: 180 },

  // Masonry
  { tool_key: "Spirit Level (Leveler)", category: "Masonry", unit_price: 350 },
  { tool_key: "Trowel (Paleta)", category: "Masonry", unit_price: 120 },
  { tool_key: "Plastering Trowel", category: "Masonry", unit_price: 150 },
  { tool_key: "Mason Line & Chalk", category: "Masonry", unit_price: 80 },
  { tool_key: "Plumb Bob (Tuldok)", category: "Masonry", unit_price: 120 },

  // Equipment / Power Tools
  { tool_key: "Concrete Mixer (1 bagger)", category: "Equipment", unit_price: 85000 },
  { tool_key: "Welding Machine (Portable)", category: "Equipment", unit_price: 8500 },
  { tool_key: "Angle Grinder (Grinder)", category: "Equipment", unit_price: 2500 },
  { tool_key: "Electric Drill", category: "Equipment", unit_price: 2800 },

  // Plumbing
  { tool_key: "Pipe Wrench (12\")", category: "Plumbing", unit_price: 450 },
  { tool_key: "PVC Cutter", category: "Plumbing", unit_price: 350 },

  // Electrical
  { tool_key: "Wire Stripper", category: "Electrical", unit_price: 280 },
  { tool_key: "Lineman Pliers", category: "Electrical", unit_price: 350 },
  { tool_key: "Voltage Tester", category: "Electrical", unit_price: 250 },

  // Safety & Staging
  { tool_key: "Scaffolding Set (2-bay)", category: "Safety", unit_price: 12000 },
  { tool_key: "Hard Hat", category: "Safety", unit_price: 250 },
  { tool_key: "Safety Harness", category: "Safety", unit_price: 1500 }
];

let cachedTools = null;

export async function syncToolsFromDb() {
  if (typeof fetch !== "function") return;
  try {
    const res = await fetch("/api/tools");
    if (!res.ok) return;
    const json = await res.json();
    if (json && json.success && Array.isArray(json.tools) && json.tools.length > 0) {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("buildwise-tools-catalog", JSON.stringify(json.tools));
      }
      cachedTools = json.tools;
    }
  } catch (err) {
    console.warn("Could not sync tools from database, using cached/defaults", err);
  }
}

export function getEffectiveTools() {
  if (cachedTools) return cachedTools;

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem("buildwise-tools-catalog");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedTools = parsed;
          return cachedTools;
        }
      }
    }
  } catch (e) {
    console.warn("Error reading buildwise-tools-catalog from localStorage", e);
  }

  cachedTools = [...DEFAULT_TOOLS_LIST];
  return cachedTools;
}

export function refreshCustomTools() {
  cachedTools = null;
  return getEffectiveTools();
}

// Initial load
refreshCustomTools();

// Background sync if running in browser
if (typeof window !== "undefined" && typeof fetch === "function") {
  syncToolsFromDb().catch(() => {});
  window.addEventListener("storage", (e) => {
    if (e.key === "buildwise-tools-catalog") {
      refreshCustomTools();
    }
  });
}

export function getToolsCost(tools = []) {
  return tools.reduce((sum, t) => sum + (parseFloat(t.unit_price) || 0), 0);
}

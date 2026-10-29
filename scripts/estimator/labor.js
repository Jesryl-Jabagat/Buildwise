// scripts/estimator/labor.js

// ─── DB Sync ────────────────────────────────────────────────────────────────
// Fetches live labor rates and multipliers from the database and updates
// the local cache + localStorage so getLaborRates() / getLaborMultiplier()
// always reflect the latest admin-set values without needing a page reload.
export async function syncLaborFromDb() {
    if (typeof fetch !== "function") return;
    try {
        const res = await fetch("/api/labor");
        if (!res.ok) return;
        const json = await res.json();
        if (json && json.success) {
            const newRates = {};
            const newMultipliers = {};
            if (Array.isArray(json.rates)) {
                json.rates.forEach(r => {
                    newRates[r.role_key] = parseFloat(r.daily_wage);
                });
            }
            if (Array.isArray(json.multipliers)) {
                json.multipliers.forEach(m => {
                    newMultipliers[m.type_key] = parseFloat(m.multiplier);
                });
            }
            cachedCustomLabor = { rates: newRates, multipliers: newMultipliers };
            if (typeof window !== "undefined" && window.localStorage) {
                localStorage.setItem("buildwise-custom-labor", JSON.stringify(cachedCustomLabor));
            }
        }
    } catch (err) {
        console.warn("Could not sync labor from database, using cached/defaults", err);
    }
}

export const DEFAULT_LABOR_RATES = {
    "Lead Carpenter / Master Builder": 550,
    "Mason": 550,
    "Helper / Ordinary Laborer": 400,
    "Electrician": 600,
    "Plumber": 600,
    "Tile Setter": 600,
    "Painter": 550
};

export const DEFAULT_LABOR_MULTIPLIERS = {
    "half-amakan": 0.20,
    "half-metal": 0.20,
    "chb": 0.25,
    "loft": 0.35,
    "two-storey": 0.35,
    "default": 0.30
};

let cachedCustomLabor = {
    rates: {},
    multipliers: {}
};

export function refreshCustomLabor() {
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            const customData = localStorage.getItem("buildwise-custom-labor");
            if (customData) {
                cachedCustomLabor = JSON.parse(customData);
                if (!cachedCustomLabor.rates) cachedCustomLabor.rates = {};
                if (!cachedCustomLabor.multipliers) cachedCustomLabor.multipliers = {};
            } else {
                cachedCustomLabor = { rates: {}, multipliers: {} };
            }
        } else {
            cachedCustomLabor = { rates: {}, multipliers: {} };
        }
    } catch(e) {
        console.warn("Could not parse custom labor settings", e);
        cachedCustomLabor = { rates: {}, multipliers: {} };
    }
}

// Initial load
refreshCustomLabor();

// Listen for storage events in case another tab changes it
if (typeof window !== "undefined") {
    window.addEventListener('storage', (e) => {
        if (e.key === 'buildwise-custom-labor') {
            refreshCustomLabor();
        }
    });
}

export function getLaborRates() {
    const rates = { ...DEFAULT_LABOR_RATES };
    for (const [role, defaultRate] of Object.entries(rates)) {
        if (cachedCustomLabor.rates[role] !== undefined) {
            rates[role] = cachedCustomLabor.rates[role];
        }
    }
    return rates;
}

export function getLaborMultiplier(typeKey) {
    // Determine the base multiplier key
    let key = "default";
    if (DEFAULT_LABOR_MULTIPLIERS[typeKey] !== undefined) {
        key = typeKey;
    }
    
    // Check if there is a custom multiplier for this key
    if (cachedCustomLabor.multipliers[key] !== undefined) {
        return cachedCustomLabor.multipliers[key];
    }
    
    return DEFAULT_LABOR_MULTIPLIERS[key];
}

// Background sync from database on page load
if (typeof window !== "undefined" && typeof fetch === "function") {
    syncLaborFromDb().catch(() => {});
}

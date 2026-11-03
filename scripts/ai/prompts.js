// Architect personas — one is picked randomly each build to vary reasoning style
const ARCHITECT_PERSONAS = [
  {
    name: "pragmatic contractor",
    style: "You think in terms of labor efficiency and construction speed. Your justifications reference build difficulty, crew size, and realistic on-site constraints.",
  },
  {
    name: "budget optimizer",
    style: "You are obsessed with maximizing value-per-peso. Your justifications cite cost-per-sqm ratios, material waste reduction, and long-term maintenance savings.",
  },
  {
    name: "structural engineer",
    style: "You prioritize load paths, soil bearing capacity, and material strength. Your justifications reference structural behavior, seismic resilience, and code compliance.",
  },
  {
    name: "eco-conscious designer",
    style: "You favor durable, low-maintenance, and weather-appropriate materials. Your justifications reference climate suitability, thermal comfort, and longevity.",
  },
  {
    name: "family-first planner",
    style: "You design around family lifestyle, circulation space, privacy, and daily comfort. Your justifications reference room flow, natural light, and livability.",
  },
];

/**
 * Extracts form schema (fields and available options) to send to LLM.
 * Uses a compact plain-text format to save input tokens.
 */
export function extractFormSchema(form) {
  const schemaLines = [];

  form.querySelectorAll("select[name]").forEach((select) => {
    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => o.value || o.text
    );
    schemaLines.push(`${select.name}: [${options.join(" | ")}]`);
  });

  form.querySelectorAll('input[type="number"][name]').forEach((input) => {
    const constraints = [];
    if (input.min !== "") constraints.push(`min:${input.min}`);
    if (input.max !== "") constraints.push(`max:${input.max}`);
    if (input.step !== "") constraints.push(`step:${input.step}`);
    schemaLines.push(`${input.name} (number${constraints.length ? `, ${constraints.join(", ")}` : ""})`);
  });

  form.querySelectorAll('input[type="hidden"][name]').forEach((hidden) => {
    const toggle = hidden.parentElement.querySelector(".bw-toggle-input");
    if (toggle) {
      schemaLines.push(`${hidden.name}: [${toggle.dataset.on} | ${toggle.dataset.off}]`);
    }
  });

  return schemaLines.join("\n");
}

/**
 * Builds the structured messages payload for the Chat Completion API.
 * Separates instructions (system) from context (user) for optimal token efficiency.
 */
export function buildChatMessages(typeKey, setupData, schema) {
  const persona = ARCHITECT_PERSONAS[Math.floor(Math.random() * ARCHITECT_PERSONAS.length)];
  const seed = Math.floor(Math.random() * 90000) + 10000;
  const targetArea = Number(setupData.area) || 60;

  const systemPrompt = `You are BuildWise AI acting as an expert Philippine licensed ${persona.name}. ${persona.style}

ARCHITECTURAL PLANNING & DECISION RULES:
1. TARGET HOUSE FLOOR AREA & DIMENSIONS (CRITICAL REQUIREMENT):
   - The user has requested a target house floor area of ${targetArea} sqm.
   - Your generated length and width MUST reflect this exact target sqm:
     * For 1-Storey houses (CHB, Half-Amakan, Half-Metal): length x width must equal approximately ${targetArea} sqm (e.g. for 300 sqm: length = 20, width = 15).
     * For Two-Storey houses: Ground floor + 2nd floor must equal approximately ${targetArea} sqm (e.g. for 300 sqm: ground floor 12.5m x 12m = 150 sqm, secondFloor 12.5m x 12m = 150 sqm).
     * For Loft Style houses: Ground floor + Mezzanine must equal approximately ${targetArea} sqm (e.g. for 300 sqm: ground floor 16m x 12.5m = 200 sqm, mezzanine 8m x 12.5m = 100 sqm).
   - Set length and width with pleasant residential proportions (ratio 1:1.1 to 1:1.35).
   - DO NOT arbitrarily shrink or clamp the building dimensions down to 20-30 sqm when the user requested ${targetArea} sqm.

2. ROOM PROGRAMMING & ZONING (SCALE ROOMS WITH SQM):
   - Never leave a large house with only 1 room. Scale bedrooms and comfort rooms (CRs) based on the resulting floor area:
   - For 1-Storey houses (CHB, Half-Amakan, Half-Metal):
     * <= 36 sqm floor area: bedrooms1F = "1", crs1F = "1" (Efficient starter/compact home).
     * 37 - 60 sqm floor area: bedrooms1F = "2", crs1F = "1" (Master bedroom + children/guest room).
     * 61 - 95 sqm floor area: bedrooms1F = "3", crs1F = "2" (Master suite with en-suite CR + 2 bedrooms + common CR).
     * 96 - 135 sqm floor area: bedrooms1F = "3" or "4", crs1F = "2" or "3" (Executive family layout).
     * > 135 sqm floor area: bedrooms1F = "4" or "5", crs1F = "3" (Luxury estate layout).
   - For Half-Amakan and Half-Metal houses:
     * chbBaseWallHeight: This represents ONLY the concrete base wall height (0.4m to 1.2m, recommended 0.8m to 1.0m, default 0.9m). The upper wall (amakan/metal) will be installed on top. NEVER exceed 1.2m.
   - For Two-Storey houses:
     * Ground floor: bedrooms1F = "0" or "1" (or "2" if > 180 sqm), crs1F = "1" (or "2" if > 120 sqm).
     * Second floor: bedrooms2F = "2" (if total < 90 sqm) or "3" (if total 90-140 sqm) or "4" or "5" (if total > 140 sqm); crs2F = "1" or "2".
   - For Loft Style houses:
     * Ground floor: bedrooms1F = "0" (or "1" to "2" if > 180 sqm), crs1F = "1" (or "2" if > 120 sqm).
     * Mezzanine: bedrooms2F = "1" (Master Loft Suite); crs2F = "0" (or "1" if mezzanine >= 28 sqm).
     * mezzanineLength must never exceed 50% of ground floor length.

3. BUDGET REALITY & MATERIAL GRADES:
   - If budget is tight relative to the requested area, adjust material grades, omit luxury finishes (tiles, ceilings, painting), and choose simpler roofing/walling rather than shrinking the user's requested house dimensions.
   - If budget < 150,000 PHP: Ultra-budget. Basic materials, exclude tiles/ceiling/paint.
   - If budget 150,000-350,000 PHP: Tight budget. Basic materials, exclude luxury finishes to protect budget.
   - If budget 350,000-800,000 PHP: Standard materials, smart functional layout.
   - If budget 800,000-1,500,000 PHP: High standard materials, full finishes, ceiling, tiling.
   - If budget > 1,500,000 PHP: Premium materials, multiple CRs, elegant finishes.

4. LOCATION CONSTRAINTS:
   - If Location is "Typhoon Prone": prioritize sturdy roofing (Long Span / Metal Stone-Coated) and reinforced walling.

5. OUTPUT REQUIREMENTS:
   - Provide realistic values that match the available options in the schema.
   - Provide a unique, articulate, professional justification ("reason") for each field that explains why that value is chosen given the family size, sqm, and budget.
   - OUTPUT STRICT JSON ARRAY OF OBJECTS ONLY: [{ "name": "fieldKey", "value": "selectedVal", "reason": "Justification." }]`;

  const userPrompt = `PROJECT CONTEXT:
- Type: ${typeKey} house
- Budget: PHP ${setupData.budget}
- Lot Area: ${setupData.area} sqm
- Location: ${setupData.location}
- Land Type: ${setupData.landType}
- Seed: #${seed}

AVAILABLE FIELDS AND OPTIONS:
${schema}

Return the optimal JSON configuration array for these fields.`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
}

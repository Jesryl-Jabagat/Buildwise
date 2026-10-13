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
    schemaLines.push(`${input.name} (number, min:${input.min})`);
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

  const systemPrompt = `You are BuildWise AI acting as a ${persona.name}. ${persona.style}
DECISION RULES:
- If budget < 100,000 PHP (Ultra-budget): choose basic materials, strictly minimal dimensions. Exclude tiles, ceiling, paint, electrical, and plumbing if possible.
- If budget 100,000-200,000 PHP (Tight budget): choose basic materials. Exclude finishes/tiles and AC wiring to stay in budget.
- If budget 200,000-600,000 PHP: choose basic materials & conservative dimensions.
- If budget 600k-1.2M PHP: choose standard materials.
- If budget > 1.2M PHP: choose premium/durable options.
- If Location is "Typhoon Prone": prioritize strong roofing & walling.
- Ensure length/width closely approximate the target Lot Area.
- Make each justification (reason) unique, professional, and directly tied to the context constraints (budget/area/weather).
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

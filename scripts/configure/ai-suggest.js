import { CONNECTOR } from "../env.js?v=4";

/**
 * Extracts form schema (fields and available options) to send to Gemini.
 * Uses a compact plain-text format to save input tokens.
 */
function extractFormSchema(form) {
  const schemaLines = [];

  // Get all select inputs
  form.querySelectorAll("select[name]").forEach((select) => {
    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => o.value || o.text,
    );
    schemaLines.push(`${select.name}: [${options.join(" | ")}]`);
  });

  // Get all number inputs (dimensions)
  form.querySelectorAll('input[type="number"][name]').forEach((input) => {
    schemaLines.push(`${input.name} (number, min:${input.min})`);
  });

  // Get all toggles (they use hidden inputs in this system to store Yes/No)
  form.querySelectorAll('input[type="hidden"][name]').forEach((hidden) => {
    // Check if it belongs to a toggle
    const toggle = hidden.parentElement.querySelector(".bw-toggle-input");
    if (toggle) {
      schemaLines.push(`${hidden.name}: [${toggle.dataset.on} | ${toggle.dataset.off}]`);
    }
  });

  return schemaLines.join("\n");
}

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
 * Builds the prompt for Gemini with a rotating persona, anti-repetition rules,
 * field-specific hints, and a random seed to produce varied, realistic reasoning.
 */
function buildPrompt(typeKey, setupData, schema) {
  const persona = ARCHITECT_PERSONAS[Math.floor(Math.random() * ARCHITECT_PERSONAS.length)];
  const seed = Math.floor(Math.random() * 90000) + 10000;

  return `You are BuildWise AI acting as a ${persona.name}.
${persona.style}

The user wants to build a "${typeKey}" house.

CONTEXT:
- Budget: PHP ${setupData.budget}
- Lot Area: ${setupData.area} sqm
- Location: ${setupData.location}
- Land Type: ${setupData.landType}
- Variation Seed: #${seed}

DECISION RULES:
- If budget is low (under PHP 600,000), choose basic materials and conservative dimensions.
- If budget is moderate (PHP 600,000–1,200,000), choose standard materials with thoughtful choices.
- If budget is high (over PHP 1,200,000), choose premium or durable options.
- If Location is "Typhoon Prone", prioritize stronger roofing and walling materials.
- If Land Type is "Rocky" or "Hard", choose harder soil condition settings.
- For soilCondition, reference actual land type from context.
- For roofStyle, reference location and weather exposure.
- For dimensions (length, width), ensure the product approximates the lot area and is buildable.

REASONING RULES — CRITICAL:
- Every "reason" MUST be unique. Do NOT repeat similar phrasing across fields.
- Each reason must reference at least ONE specific detail from the CONTEXT above (budget amount, lot area, location, land type, or family size).
- Avoid generic phrases like "good balance", "selected because", "provides a good", "this is suitable".
- Make each justification feel like it came from a real ${persona.name} who studied the project.

BAD reason examples (DO NOT USE THESE PATTERNS):
  "Standard grade provides a good balance for your budget."
  "Selected because your land type is Rocky."
  "This is suitable for your budget."

GOOD reason examples:
  "At PHP ${setupData.budget}, locking in Standard grade now preserves roughly 15% of the budget for finishing fixtures the estimator excludes."
  "The ${setupData.landType} soil profile at this site demands a harder bearing condition to avoid excessive footing depth — choosing Firm Hard Rock prevents cost blowout at excavation."
  "A ${setupData.area}sqm lot in ${setupData.location} gets significant wind exposure; Long Span Pre-Painted steel resists uplift far better than corrugated GI at this footprint."

SCHEMA (select optimal value for EACH field):
${schema}

Return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.
Each object must have:
  "name": the exact field name
  "value": the exact value you selected from the options (or a sensible number)
  "reason": A unique, specific, 1–2 sentence justification written as a ${persona.name} would say it.
`;
}

/**
 * Parses the AI response with a multi-strategy fallback to prevent breakage.
 */
function parseAiResponse(rawText) {
  let cleanText = rawText.trim();
  
  // Strategy 1: Direct parse
  try {
    const result = JSON.parse(cleanText.replace(/```json/gi, "").replace(/```/g, "").trim());
    if (Array.isArray(result) && result.length > 0 && result[0].name) return result;
  } catch(e) {}

  // Strategy 2: Extract bracket block
  try {
    const match = cleanText.match(/\[[\s\S]*\]/);
    if (match) {
      const result = JSON.parse(match[0]);
      if (Array.isArray(result) && result.length > 0 && result[0].name) return result;
    }
  } catch(e) {}

  // Strategy 3: Extract object block and arrayify
  try {
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (match) {
      const obj = JSON.parse(match[0]);
      let arr = obj.suggestions || obj.fields || obj.configuration || null;
      if (!arr && obj.name && obj.value) arr = [obj];
      if (Array.isArray(arr) && arr.length > 0 && arr[0].name) return arr;
    }
  } catch(e) {}

  // Strategy 4: Trailing comma repair
  try {
    const repaired = cleanText.replace(/,\s*([}\]])/g, "$1");
    const match = repaired.match(/\[[\s\S]*\]/);
    if (match) {
      const result = JSON.parse(match[0]);
      if (Array.isArray(result) && result.length > 0 && result[0].name) return result;
    }
  } catch(e) {}

  // Strategy 5: Partial regex recovery
  try {
    const regex = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"value"\s*:\s*(?:"([^"]+)"|([^,]+))\s*,\s*"reason"\s*:\s*"([^"]+)"\s*\}/g;
    const results = [];
    let match;
    while ((match = regex.exec(cleanText)) !== null) {
      let val = match[2] !== undefined ? match[2] : match[3].trim();
      if (!isNaN(Number(val))) val = Number(val);
      results.push({ name: match[1], value: val, reason: match[4] });
    }
    if (results.length > 0) return results;
  } catch(e) {}

  return null;
}

/**
 * Executes a single API call with the provided key.
 */
async function makeApiCall(prompt, connectorKey) {
  const url = `https://openrouter.ai/api/v1/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${connectorKey}`,
      "HTTP-Referer": window.location.href,
      "X-Title": "BuildWise AI",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash", // You can change this to any OpenRouter model like openai/gpt-4o-mini
      max_tokens: 1000, // Reduced from 1500 because the OpenRouter account is running low on credits
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  const rawText = data.choices[0].message.content;
  const parsed = parseAiResponse(rawText);
  if (!parsed) {
    throw new Error("Parse failure. Raw output: " + rawText.substring(0, 100));
  }
  return parsed;
}

/**
 * Wraps the API call with 2 auto-retries.
 */
async function callWithRetry(prompt) {
  // Attempt 1
  try {
    console.log("AI Attempt 1");
    return await makeApiCall(prompt, CONNECTOR);
  } catch (e) {
    console.warn("Attempt 1 failed:", e);
  }

  // Attempt 2
  try {
    console.log("AI Attempt 2");
    return await makeApiCall(prompt, CONNECTOR);
  } catch (e) {
    console.warn("Attempt 2 failed:", e);
  }

  // Attempt 3: Final fallback
  try {
    console.log("AI Attempt 3 (Final)");
    return await makeApiCall(prompt, CONNECTOR);
  } catch (e) {
    console.error("All AI attempts failed:", e);
    return null; // Return null instead of throwing to degrade gracefully
  }
}

/**
 * Fetches the configuration from OpenRouter API with retries and robust parsing.
 */
async function fetchAiConfiguration(prompt) {
  return await callWithRetry(prompt);
}

/**
 * Helper to show the floating tooltip.
 */
function showTooltip(element, text) {
  const tooltip = document.createElement("div");
  tooltip.className = "ai-tooltip";
  tooltip.innerHTML = `<span class="ai-tooltip-icon">✨</span><span class="ai-tooltip-text">${text}</span>`;

  const rect = element.getBoundingClientRect();
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    tooltip.classList.add("ai-tooltip--mobile");
  } else {
    // Offset slightly higher than the element
    tooltip.style.top = window.scrollY + rect.top - 10 + "px";
    
    // Check if there is enough space on the right side
    if (rect.right + 320 < window.innerWidth) {
      tooltip.style.left = window.scrollX + rect.right + 20 + "px";
    } else {
      // If not enough space, place it on the left side
      tooltip.style.left = window.scrollX + rect.left - 320 + "px";
    }
  }

  document.body.appendChild(tooltip);

  // Cleanup after animation
  setTimeout(() => {
    if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
  }, 4000);
}

/**
 * Helper to find the DOM element for a given name.
 */
function getElementForName(form, name) {
  let el = form.querySelector(
    `select[name="${name}"], input[type="number"][name="${name}"]`,
  );
  let isToggle = false;
  let toggleCheckbox = null;

  if (!el) {
    el = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (el) {
      toggleCheckbox = el.parentElement.querySelector(".bw-toggle-input");
      if (toggleCheckbox) {
        isToggle = true;
        el = toggleCheckbox;
      }
    }
  }

  return { el, isToggle, toggleCheckbox };
}

/**
 * Main animation loop that ghost-types the form.
 */
async function runAnimationLoop(form, suggestions) {
  // Sort suggestions by their physical DOM vertical position so we scroll smoothly top-to-bottom
  suggestions.sort((a, b) => {
    const nodeA = getElementForName(form, a.name).el;
    const nodeB = getElementForName(form, b.name).el;

    // Use offsetTop relative to the document
    const posA = nodeA ? nodeA.getBoundingClientRect().top + window.scrollY : 0;
    const posB = nodeB ? nodeB.getBoundingClientRect().top + window.scrollY : 0;
    return posA - posB;
  });

  for (const suggestion of suggestions) {
    const { name, value, reason } = suggestion;

    const { el, isToggle, toggleCheckbox } = getElementForName(form, name);

    if (!el) continue;

    // Scroll to element smoothly
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Highlight
    el.classList.add("ai-highlight");
    if (isToggle) el.parentElement.classList.add("ai-highlight");

    // Small pause to let user see where we are
    await new Promise((r) => setTimeout(r, 600));

    // Change value
    if (isToggle) {
      const isChecking = value === toggleCheckbox.dataset.on;
      if (toggleCheckbox.checked !== isChecking) {
        toggleCheckbox.checked = isChecking;
        toggleCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Show Tooltip
    showTooltip(isToggle ? toggleCheckbox.parentElement : el, reason);

    // Pause to let them read
    await new Promise((r) => setTimeout(r, 1400));

    // Remove highlight
    el.classList.remove("ai-highlight");
    if (isToggle) el.parentElement.classList.remove("ai-highlight");
  }
}

/**
 * Entry point.
 */
export async function startAiBuilder(form, typeKey, setupData) {
  const overlay = document.getElementById("aiOverlay");
  if (overlay) overlay.style.display = "flex";

  // Ensure advanced mode is open so we can interact with all fields
  const advancedToggle = document.querySelector(".bw-advanced-toggle-input");
  if (advancedToggle && !advancedToggle.checked) {
    advancedToggle.checked = true;
    advancedToggle.dispatchEvent(new Event("change", { bubbles: true }));
  }

  try {
    const schema = extractFormSchema(form);
    const prompt = buildPrompt(typeKey, setupData, schema);

    const suggestions = await fetchAiConfiguration(prompt);

    if (suggestions && suggestions.length > 0) {
      // Hide the loading spinner, but keep the dark overlay so they can't click
      const spinner = overlay.querySelector(".spinner-border");
      if (spinner) spinner.style.display = "none";
      const text = overlay.querySelector("h3");
      if (text) text.innerText = "AI Architect is building...";

      // Let overlay be click-through so they can see tooltips properly
      overlay.style.pointerEvents = "none";
      overlay.style.background = "rgba(0,0,0,0.4)";

      await runAnimationLoop(form, suggestions);

      // Submit the form
      const submitBtn = form.querySelector(".create-plan-button");
      if (submitBtn) {
        submitBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        submitBtn.classList.add("ai-highlight");
        await new Promise((r) => setTimeout(r, 1000));
        submitBtn.click();
      }
    } else {
      console.warn("AI failed to generate suggestions. Switching to manual mode.");
      if (overlay) {
        const text = overlay.querySelector("h3");
        if (text) text.innerText = "AI couldn't complete. Switching to manual mode...";
        const spinner = overlay.querySelector(".spinner-border");
        if (spinner) spinner.style.display = "none";
        setTimeout(() => overlay.style.display = "none", 2000);
      }
    }
  } catch (err) {
    console.error("AI Error", err);
    if (overlay) {
      const text = overlay.querySelector("h3");
      if (text) text.innerText = "AI couldn't complete. Switching to manual mode...";
      const spinner = overlay.querySelector(".spinner-border");
      if (spinner) spinner.style.display = "none";
      setTimeout(() => overlay.style.display = "none", 2000);
    }
  }
}

const AGENT_MAP = {
  // Architect
  length: "architect",
  width: "architect",
  groundLength: "architect",
  groundWidth: "architect",
  secondFloorLength: "architect",
  secondFloorWidth: "architect",
  mezzanineLength: "architect",
  mezzanineWidth: "architect",
  wallHeight: "architect",
  bedrooms1F: "architect",
  bedrooms2F: "architect",
  crs1F: "architect",
  crs2F: "architect",
  roofStyle: "architect",
  roofType: "architect",
  wallingTypeAboveChb: "architect",
  
  // Structural Engineer
  soilCondition: "engineer",
  chbType: "engineer",
  materialGrade: "engineer",
  chbBaseWallHeight: "engineer",

  // Interior Designer
  paintColorTheme: "designer",
  tileSize: "designer",
  boardType: "designer",
  hasCeiling: "designer",
  includePainting: "designer",
  includePlastering: "designer",
  applyTilesGround: "designer",
  applyTilesSecond: "designer"
};

const AGENT_PROFILES = {
  architect: { name: "AI Architect", emoji: "🏗️", color: "var(--primary)", action: "Setting up your floor plan..." },
  engineer: { name: "Structural Engineer", emoji: "🔧", color: "#5B8DEF", action: "Analyzing soil and materials..." },
  designer: { name: "Interior Designer", emoji: "🎨", color: "var(--accent)", action: "Selecting finishes..." },
  optimizer: { name: "Cost Optimizer", emoji: "📐", color: "#E07B5A", action: "Finalizing budget..." }
};

const AGENT_ORDER = ["architect", "engineer", "designer", "optimizer"];

/**
 * Main animation loop for the dedicated Analyzing page.
 * Applies values silently to the hidden form and renders chat bubbles.
 */
async function runAnalyzingLoop(form, suggestions) {
  const feed = document.getElementById("aiFeed");
  const progress = document.getElementById("aiProgress");
  const header = document.getElementById("aiHeader");
  const container = document.querySelector(".analyzing-container");
  if (!feed) return;

  // Sort suggestions by agent
  suggestions.sort((a, b) => {
    const agentA = AGENT_MAP[a.name] || "optimizer";
    const agentB = AGENT_MAP[b.name] || "optimizer";
    return AGENT_ORDER.indexOf(agentA) - AGENT_ORDER.indexOf(agentB);
  });

  let currentStep = 0;
  const totalSteps = suggestions.length;
  let currentAgentKey = null;
  let isFirstBubble = true;

  for (const suggestion of suggestions) {
    if (isFirstBubble && container) {
      container.classList.add("has-bubbles");
      isFirstBubble = false;
    }
    
    currentStep++;
    if (progress) {
      progress.innerText = `Step ${currentStep} of ${totalSteps} — Configuring...`;
    }
    const { name, value, reason } = suggestion;
    const { el, isToggle, toggleCheckbox } = getElementForName(form, name);

    if (!el) continue;

    const agentKey = AGENT_MAP[name] || "optimizer";
    const agent = AGENT_PROFILES[agentKey];

    // Transition header if agent changes
    if (agentKey !== currentAgentKey) {
      if (header) {
        if (container) container.style.setProperty("--orb-color", agent.color);
        
        const h2 = header.querySelector("h2");
        const status = header.querySelector("#aiStatus");
        
        if (h2) {
           h2.style.opacity = 0;
           setTimeout(() => {
             h2.innerText = `${agent.emoji} ${agent.name}`;
             h2.style.opacity = 1;
           }, 250);
        }
        
        if (status) {
           status.style.opacity = 0;
           setTimeout(() => {
             status.innerText = agent.action;
             status.style.opacity = 1;
           }, 250);
        }
      }
      currentAgentKey = agentKey;
      
      // Give a tiny bit of extra pause for transition before bubble appears
      await new Promise(r => setTimeout(r, 600));
    }

    // Apply the value to the hidden form instantly
    if (isToggle) {
      const isChecking = value === toggleCheckbox.dataset.on;
      if (toggleCheckbox.checked !== isChecking) {
        toggleCheckbox.checked = isChecking;
        toggleCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Format the field name to look nicer (e.g. "roofStyle" -> "Roof Style")
    const formattedName = name.replace(/([A-Z])/g, ' $1').trim();
    const finalName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    
    // Format the value nicely
    let displayValue = String(value);
    if (displayValue === "true") displayValue = "Yes";
    if (displayValue === "false") displayValue = "No";
    displayValue = displayValue.replace(/([A-Z])/g, ' $1').trim();
    displayValue = displayValue.charAt(0).toUpperCase() + displayValue.slice(1);

    // Render the chat bubble
    const bubble = document.createElement("div");
    bubble.className = "ai-bubble";
    bubble.style.setProperty("--agent-color", agent.color);
    bubble.innerHTML = `
      <div class="ai-bubble-icon" style="background: color-mix(in srgb, ${agent.color} 20%, transparent)">${agent.emoji}</div>
      <div class="ai-bubble-content">
        <div class="ai-bubble-field" style="background: ${agent.color}">${finalName}</div>
        <div class="ai-bubble-value">${displayValue}</div>
        <span class="agent-tag">${agent.name}</span>
        <div class="ai-bubble-text">${reason}</div>
      </div>
    `;
    
    feed.appendChild(bubble);
    
    // Scroll smoothly to the bottom of the feed
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    // Pause to simulate generation and let the user read
    await new Promise((r) => setTimeout(r, 1200));
  }
}

/**
 * Entry point for the dedicated Analyzing page.
 */
export async function startAiAnalyzing(form, typeKey, setupData) {
  // Ensure advanced mode is open so we can interact with all fields
  const advancedToggle = form.querySelector(".bw-advanced-toggle-input");
  if (advancedToggle && !advancedToggle.checked) {
    advancedToggle.checked = true;
    advancedToggle.dispatchEvent(new Event("change", { bubbles: true }));
  }

  try {
    const schema = extractFormSchema(form);
    const prompt = buildPrompt(typeKey, setupData, schema);

    const suggestions = await fetchAiConfiguration(prompt);

    if (suggestions && suggestions.length > 0) {
      // Hide the loading spinner (legacy)
      const header = document.getElementById("aiHeader");
      if (header) {
        const spinner = header.querySelector(".spinner-grow");
        if (spinner) spinner.style.display = "none";
        
        const progress = header.querySelector("#aiProgress");
        if (progress) progress.innerText = "Processing configuration...";
        
        const status = header.querySelector("#aiStatus");
        if (status) status.innerText = "Applying optimal materials and styles...";
      }

      await runAnalyzingLoop(form, suggestions);
      
      // Update header to complete
      if (header) {
        header.classList.add("complete");
        const h2 = header.querySelector("h2");
        if (h2) h2.innerText = "Configuration Complete!";
        
        const progress = header.querySelector("#aiProgress");
        if (progress) progress.innerText = "Done";
        
        const status = header.querySelector("#aiStatus");
        if (status) status.innerText = "Redirecting to your results...";
      }

      await new Promise((r) => setTimeout(r, 1500));

      // Submit the form to trigger save and redirect to result.html
      const submitBtn = form.querySelector(".create-plan-button");
      if (submitBtn) {
        submitBtn.click();
      }
    } else {
      console.warn("AI failed to generate suggestions.");
      showAiErrorState(form, typeKey, setupData);
    }
  } catch (err) {
    console.error("AI Error", err);
    showAiErrorState(form, typeKey, setupData);
  }
}

function showAiErrorState(form, typeKey, setupData) {
  const header = document.getElementById("aiHeader");
  if (!header) {
    const typeParam = typeKey ? `?type=${typeKey}` : '';
    window.location.href = `configure.html${typeParam}`;
    return;
  }

  const spinner = header.querySelector(".spinner-grow");
  if (spinner) spinner.style.display = "none";
  
  const h2 = header.querySelector("h2");
  if (h2) {
    h2.innerText = "AI Unavailable";
    h2.style.color = "var(--danger, #ef4444)";
  }
  
  const progress = header.querySelector("#aiProgress");
  if (progress) progress.innerText = "Analysis Failed";
  
  const status = header.querySelector("#aiStatus") || header.querySelector("p");
  if (status) status.innerText = "Our AI couldn't complete your configuration. This is usually temporary.";
  
  header.style.animation = "none";
  
  let errorActions = document.getElementById("aiErrorActions");
  if (!errorActions) {
    errorActions = document.createElement("div");
    errorActions.id = "aiErrorActions";
    errorActions.style.display = "flex";
    errorActions.style.gap = "16px";
    errorActions.style.justifyContent = "center";
    errorActions.style.marginTop = "24px";
    
    const tryAgainBtn = document.createElement("button");
    tryAgainBtn.style.cssText = "padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; display: flex; align-items: center; gap: 8px;";
    tryAgainBtn.innerHTML = "<span>🔄</span> Try Again";
    tryAgainBtn.onmouseover = () => tryAgainBtn.style.background = "rgba(255,255,255,0.1)";
    tryAgainBtn.onmouseout = () => tryAgainBtn.style.background = "transparent";
    tryAgainBtn.onclick = () => {
      if (h2) {
        h2.innerText = "BuildWise AI Architect";
        h2.style.color = "";
      }
      if (progress) progress.innerText = "Initializing...";
      if (status) status.innerText = "Drafting your perfect home configuration...";
      errorActions.remove();
      startAiAnalyzing(form, typeKey, setupData);
    };
    
    const manualBtn = document.createElement("button");
    manualBtn.style.cssText = "padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; background: var(--primary, #f59e0b); color: #000; display: flex; align-items: center; gap: 8px;";
    manualBtn.innerHTML = "<span>⚙️</span> Configure Manually";
    manualBtn.onmouseover = () => manualBtn.style.opacity = "0.9";
    manualBtn.onmouseout = () => manualBtn.style.opacity = "1";
    manualBtn.onclick = () => {
      const typeParam = typeKey ? `?type=${typeKey}` : '';
      window.location.href = `configure.html${typeParam}`;
    };
    
    errorActions.appendChild(tryAgainBtn);
    errorActions.appendChild(manualBtn);
    header.appendChild(errorActions);
  }
}


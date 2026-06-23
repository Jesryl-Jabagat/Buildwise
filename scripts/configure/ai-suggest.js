import { CONNECTOR } from "../env.js";

/**
 * Extracts form schema (fields and available options) to send to Gemini.
 */
function extractFormSchema(form) {
  const schema = [];

  // Get all select inputs
  form.querySelectorAll("select[name]").forEach((select) => {
    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => o.value || o.text,
    );
    schema.push({
      name: select.name,
      type: "select",
      options: options,
      currentValue: select.value,
    });
  });

  // Get all number inputs (dimensions)
  form.querySelectorAll('input[type="number"][name]').forEach((input) => {
    schema.push({
      name: input.name,
      type: "number",
      min: input.min,
      currentValue: input.value,
    });
  });

  // Get all toggles (they use hidden inputs in this system to store Yes/No)
  form.querySelectorAll('input[type="hidden"][name]').forEach((hidden) => {
    // Check if it belongs to a toggle
    const toggle = hidden.parentElement.querySelector(".bw-toggle-input");
    if (toggle) {
      schema.push({
        name: hidden.name,
        type: "toggle",
        options: [toggle.dataset.on, toggle.dataset.off],
        currentValue: hidden.value,
      });
    }
  });

  return schema;
}

/**
 * Builds the prompt for Gemini.
 */
function buildPrompt(typeKey, setupData, schema) {
  return `You are BuildWise AI, an expert architect system.
The user wants to build a "${typeKey}" house.
Context:
- Budget: PHP ${setupData.budget}
- Lot Area: ${setupData.area} sqm
- Location: ${setupData.location}
- Land Type: ${setupData.landType}

Below is the JSON schema of the HTML form fields available for this house.
Your job is to select the optimal value for EACH field based on the budget and context.
If the budget is low, choose basic materials and smaller dimensions. If high, choose premium.
If Location is Typhoon Prone, choose stronger roofing.
If Land Type is Rocky, choose harder soil conditions.

SCHEMA:
${JSON.stringify(schema, null, 2)}

Return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.
Each object must have:
"name": the exact field name
"value": the exact value you selected from the options (or a sensible number)
"reason": A short, 1-sentence explanation of WHY you chose this based on the user's context.

Example:
[
  { "name": "materialGrade", "value": "Standard", "reason": "Standard grade provides a good balance for your 500k budget." },
  { "name": "soilCondition", "value": "Firm / Hard Rock (Limestone, Weathered Rock, Hardclay)", "reason": "Selected because your land type is Rocky." }
]
`;
}

/**
 * Fetches the configuration from OpenRouter API.
 */
async function fetchAiConfiguration(prompt) {
  const url = `https://openrouter.ai/api/v1/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONNECTOR}`,
      "HTTP-Referer": window.location.href,
      "X-Title": "BuildWise AI",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash", // You can change this to any OpenRouter model like openai/gpt-4o-mini
      max_tokens: 1500, // Added to prevent OpenRouter from trying to reserve 65k tokens which causes credit errors
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    alert("API Request failed: " + errText);
    throw new Error("API Request failed");
  }

  const data = await response.json();
  let rawText = "";
  try {
    // OpenRouter returns text in choices[0].message.content
    rawText = data.choices[0].message.content;
    // Strip markdown backticks if AI still added them
    const cleanText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    alert(
      "Failed to parse AI response. Raw text was: " +
        rawText.substring(0, 100) +
        "...",
    );
    return null;
  }
}

/**
 * Helper to show the floating tooltip.
 */
function showTooltip(element, text) {
  const tooltip = document.createElement("div");
  tooltip.className = "ai-tooltip";
  tooltip.innerText = text;

  const rect = element.getBoundingClientRect();
  tooltip.style.top = window.scrollY + rect.top - 40 + "px";
  tooltip.style.left = window.scrollX + rect.right + 20 + "px";

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
  const advancedToggle = document.getElementById("advancedModeToggle");
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
      alert("AI failed to generate suggestions. Please customize manually.");
      if (overlay) overlay.style.display = "none";
    }
  } catch (err) {
    console.error("AI Error", err);
    alert(
      "There was an error communicating with the AI. Proceeding to manual mode. Error: " +
        err.message,
    );
    if (overlay) overlay.style.display = "none";
  }
}

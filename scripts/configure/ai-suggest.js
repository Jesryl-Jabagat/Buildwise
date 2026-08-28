import { generateAiConfiguration } from "../ai/service.js";
import { getUserInput } from "./form-validation.js";
import { generateEstimate } from "../estimator/aggregator.js";

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
    const suggestions = await generateAiConfiguration(form, typeKey, setupData);

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

      // --- Budget Reconciler Loop ---
      const targetBudget = Number(setupData.budget) || 0;
      if (targetBudget > 0) {
          let currentData = getUserInput(form);
          let currentEstimate = generateEstimate(currentData);
          
          if (currentEstimate.summary && currentEstimate.summary.grandTotal > targetBudget) {
              const togglesToDisable = ["hasACWiring", "hasTiles", "hasPaint", "hasCeiling"];
              
              for (let t of togglesToDisable) {
                  const hidden = form.querySelector(`input[type="hidden"][name="${t}"]`);
                  if (hidden) {
                      const toggleBtn = hidden.parentElement.querySelector(".bw-toggle-input");
                      if (toggleBtn && toggleBtn.checked) {
                          // Scroll to toggle
                          toggleBtn.scrollIntoView({ behavior: "smooth", block: "center" });
                          toggleBtn.parentElement.classList.add("ai-highlight");
                          await new Promise((r) => setTimeout(r, 600));
                          
                          toggleBtn.checked = false;
                          toggleBtn.dispatchEvent(new Event("change", { bubbles: true }));
                          showTooltip(toggleBtn.parentElement, "AI Budget Guard: Disabled to meet strict budget constraints.");
                          
                          await new Promise((r) => setTimeout(r, 1400));
                          toggleBtn.parentElement.classList.remove("ai-highlight");
                          
                          currentData = getUserInput(form);
                          currentEstimate = generateEstimate(currentData);
                          if (currentEstimate.summary && currentEstimate.summary.grandTotal <= targetBudget) break;
                      }
                  }
              }
          }
      }

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
 * Shows a sticky "Proceed to Results" button at the bottom of the screen
 * after the AI has finished configuring all fields.
 */
function showProceedButton(form) {
  // Scroll to top so user can review from the beginning
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Create sticky footer bar
  const bar = document.createElement("div");
  bar.id = "proceedBar";
  bar.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 16px 24px;
    background: color-mix(in srgb, var(--surface, #1a1a2e) 90%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid color-mix(in srgb, var(--border, #333) 60%, transparent);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    animation: slideUpBar 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  `;

  const label = document.createElement("div");
  label.style.cssText = "display:flex;flex-direction:column;gap:2px;";
  label.innerHTML = `
    <span style="font-weight:700;font-size:15px;color:var(--text);">✅ AI Plan Ready</span>
    <span style="font-size:13px;color:var(--text-muted);">Scroll up to review the AI choices, then proceed when ready.</span>
  `;

  const btn = document.createElement("button");
  btn.innerText = "Proceed to Results →";
  btn.style.cssText = `
    padding: 14px 28px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    background: var(--primary, #f59e0b);
    color: #000;
    white-space: nowrap;
    flex-shrink: 0;
    transition: transform 0.15s ease, opacity 0.15s ease;
    box-shadow: 0 4px 20px color-mix(in srgb, var(--primary, #f59e0b) 40%, transparent);
  `;

  btn.onmouseover = () => { btn.style.transform = "scale(1.04)"; };
  btn.onmouseout  = () => { btn.style.transform = "scale(1)"; };

  btn.onclick = () => {
    btn.innerText = "Loading...";
    btn.style.opacity = "0.7";
    btn.disabled = true;
    const submitBtn = form.querySelector(".create-plan-button");
    if (submitBtn) submitBtn.click();
  };

  bar.appendChild(label);
  bar.appendChild(btn);
  document.body.appendChild(bar);
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
    const suggestions = await generateAiConfiguration(form, typeKey, setupData);

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
        if (progress) progress.innerText = "Done — Review your plan below";
        
        const status = header.querySelector("#aiStatus");
        if (status) status.innerText = "All settings configured by AI. Click Proceed when ready.";
      }

      // Show the sticky Proceed button instead of auto-redirecting
      showProceedButton(form);
    } else {
      console.warn("AI failed to generate suggestions.");
      showAiErrorState(form, typeKey, setupData, null);
    }
  } catch (err) {
    console.error("AI Error", err);
    showAiErrorState(form, typeKey, setupData, err);
  }
}

function showAiErrorState(form, typeKey, setupData, errorObj = null) {
  const header = document.getElementById("aiHeader");
  if (!header) {
    const typeParam = typeKey ? `?type=${typeKey}` : '';
    window.location.href = `configure.html${typeParam}`;
    return;
  }

  const spinner = header.querySelector(".spinner-grow");
  if (spinner) spinner.style.display = "none";
  
  const isCreditsError = errorObj && errorObj.message && errorObj.message.includes("INSUFFICIENT_CREDITS");

  const h2 = header.querySelector("h2");
  if (h2) {
    h2.innerText = isCreditsError ? "AI Credits Depleted" : "AI Unavailable";
    h2.style.color = "var(--danger, #ef4444)";
  }
  
  const progress = header.querySelector("#aiProgress");
  if (progress) progress.innerText = isCreditsError ? "Billing Error" : "Analysis Failed";
  
  const status = header.querySelector("#aiStatus") || header.querySelector("p");
  if (status) {
      status.innerText = isCreditsError 
        ? "Your API keys work, but your account balance is depleted. Please top up to use AI."
        : "Our AI systems couldn't complete your configuration. This is usually temporary.";
  }
  
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


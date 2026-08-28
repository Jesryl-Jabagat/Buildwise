/**
 * Deterministic Rule-Based Fallback Generator.
 * Used as a 4th-tier safety net when ALL cloud API providers fail.
 * It parses the form schema and returns realistic, rule-based selections.
 */
export function generateSmartFallback(form, typeKey, setupData) {
  console.warn("⚠️ Using Deterministic Rule-Based Fallback due to total API unavailability.");
  
  const suggestions = [];
  const budget = Number(setupData.budget) || 800000;
  const area = Number(setupData.area) || 50;
  
  // Calculate smart default dimensions based on lot area
  const side = Math.sqrt(area);
  const length = Math.round(side * 10) / 10;
  const width = Math.round((area / length) * 10) / 10;

  // Process Select Inputs
  form.querySelectorAll("select[name]").forEach((select) => {
    const name = select.name;
    const options = Array.from(select.querySelectorAll("option")).map(o => o.value || o.text);
    let value = options[0]; // Default to first

    if (name.includes("Grade") || name.includes("Type") || name.includes("Finish")) {
      if (budget <= 200000) value = options[0];
      else if (budget > 1200000) value = options[options.length - 1];
      else if (budget > 600000) value = options[Math.floor(options.length / 2)];
      else value = options[0];
    }

    if (name.includes("soilCondition") && setupData.landType === "Rocky") {
      value = options.find(o => o.toLowerCase().includes("rock")) || value;
    }

    suggestions.push({
      name,
      value,
      reason: `Offline Fallback: Selected ${value} based on standard rule-based metrics for a PHP ${budget.toLocaleString()} budget.`
    });
  });

  // Process Number Inputs
  form.querySelectorAll('input[type="number"][name]').forEach((input) => {
    const name = input.name;
    let value = Number(input.min) || 1;
    
    if (name.toLowerCase().includes("length")) value = length;
    if (name.toLowerCase().includes("width")) value = width;
    
    suggestions.push({
      name,
      value,
      reason: `Offline Fallback: Calculated ${value}m to optimally fit within the ${area}sqm lot area limit.`
    });
  });

  // Process Toggles
  form.querySelectorAll('input[type="hidden"][name]').forEach((hidden) => {
    const toggle = hidden.parentElement.querySelector(".bw-toggle-input");
    if (toggle) {
      const name = hidden.name;
      
      let value;
      if (budget <= 200000) {
          value = toggle.dataset.off;
      } else if (budget > 800000) {
          value = toggle.dataset.on;
      } else {
          // Mid-range: disable expensive extras
          if (name.toLowerCase().includes("ac") || name.toLowerCase().includes("finish") || name.toLowerCase().includes("ceiling")) {
              value = toggle.dataset.off;
          } else {
              value = toggle.dataset.on;
          }
      }

      suggestions.push({
        name,
        value,
        reason: `Offline Fallback: Toggled to ${value === toggle.dataset.on ? "Yes" : "No"} to keep costs balanced.`
      });
    }
  });

  return suggestions;
}

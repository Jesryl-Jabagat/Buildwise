import { houseTypes } from './house-data.js';

document.addEventListener("DOMContentLoaded", () => {
  const setupDataStr = localStorage.getItem('buildwiseSetup');
  let budget = 0;
  let area = 0;
  
  if (setupDataStr) {
    const setupData = JSON.parse(setupDataStr);
    budget = setupData.budget || 0;
    area = setupData.area || 0;
  }
  
  const container = document.getElementById("packages-container");
  if (!container) return;
  
  let html = "";
  
  for (const [key, data] of Object.entries(houseTypes)) {
    const isAllowed = budget === 0 || budget >= data.minBudget;
    
    // Add some visual indication for disabled state
    const cardStyle = isAllowed ? '' : 'opacity: 0.6; filter: grayscale(1); cursor: not-allowed;';
    const badgeHtml = isAllowed && budget > 0 
      ? `<div style="position:absolute; top:10px; right:10px; background:#e8f5e9; color:#2e7d32; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold; border:1px solid #c8e6c9;">✨ Rule-Based AI Pick</div>`
      : '';
      
    html += `
      <div class="col-md-4" style="position:relative;">
        <div class="model-card" style="${cardStyle}">
          ${badgeHtml}
          <img src="${data.image}" alt="${data.title}">
          <span class="model-card-body">
            <strong>${data.title}</strong>
            <span>${data.description}</span>
            ${isAllowed ? `<a href="configure.html?type=${key}" class="btn btn-sm btn-dark mt-2" style="position:relative; z-index:2;">CONFIGURE</a>` : `<span class="text-danger small mt-2 d-block">Requires min. ₱${data.minBudget.toLocaleString()}</span>`}
          </span>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
  
  // Also update heading if budget is provided
  if (budget > 0) {
    const heading = document.getElementById("designs-heading");
    const subheading = document.getElementById("designs-subheading");
    
    // Check mode
    const mode = setupDataStr ? JSON.parse(setupDataStr).mode : 'manual';
    
    if (mode === 'ai') {
      if(heading) heading.innerHTML = `<span style="color:var(--accent);">✨ Step 1 Complete</span>`;
      if(subheading) subheading.innerHTML = `<strong>Rule-Based AI</strong> has safely filtered models for your ₱${budget.toLocaleString()} budget.<br><br><span style="font-size: 1.2rem; font-weight: bold; color: var(--text);">👇 Select a house model below to let the Generative AI configure it!</span>`;
    } else {
      if(heading) heading.innerText = `Packages for ₱${budget.toLocaleString()}`;
      if(subheading) subheading.innerText = `Layer 1 AI has filtered the house packages that fit within your budget and area safely.`;
    }
  }
});

import { houseTypes } from './house-data.js';

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const budget = parseFloat(params.get("budget")) || 0;
  
  const container = document.getElementById("packages-container");
  if (!container) return;
  
  let html = "";
  
  for (const [key, data] of Object.entries(houseTypes)) {
    const isAllowed = budget === 0 || budget >= data.minBudget;
    
    // Add some visual indication for disabled state
    const cardStyle = isAllowed ? '' : 'opacity: 0.6; filter: grayscale(1); cursor: not-allowed;';
    
    html += `
      <div class="col-md-4">
        <div class="model-card" style="${cardStyle}">
          <img src="${data.image}" alt="${data.title}">
          <span class="model-card-body">
            <strong>${data.title}</strong>
            <span>${data.description}</span>
            ${isAllowed ? `<a href="configure.html?type=${key}&budget=${budget}" class="btn btn-sm btn-dark mt-2" style="position:relative; z-index:2;">CONFIGURE</a>` : `<span class="text-danger small mt-2 d-block">Requires min. ₱${data.minBudget.toLocaleString()}</span>`}
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
    if(heading) heading.innerText = `Packages for ₱${budget.toLocaleString()}`;
    if(subheading) subheading.innerText = `We have filtered the house packages that fit within your budget safely.`;
  }
});

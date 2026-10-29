/* ============================================================
   setup.js — Initial setup form handling
   Page: pages/setup.html
   ============================================================ */

function formatBudgetValue(val) {
  let clean = val.replace(/[^\d]/g, "");
  clean = clean.replace(/^0+(?=\d)/, "");
  if (!clean || clean === "0") return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function initSetupForm() {
  const form = document.getElementById('setupForm');
  const areaInput = document.getElementById('setupArea');
  const lotAreaNotice = document.getElementById('lotAreaNotice');
  const budgetInput = document.getElementById('setupBudget');
  const btnAi = document.getElementById('btnAi');
  const btnManual = document.getElementById('btnManual');

  if (!form) return;

  // Lot area interactive notice & validation
  function updateLotAreaNotice(isFocused = true) {
    if (!lotAreaNotice || !areaInput) return;
    const val = areaInput.value.trim();

    if (!val) {
      if (isFocused) {
        lotAreaNotice.style.display = 'flex';
        lotAreaNotice.className = 'setup-inline-notice';
        lotAreaNotice.innerHTML = '<span class="notice-icon">⚠️</span><span class="notice-text">Minimum lot area is 20 sqm.</span>';
      } else {
        lotAreaNotice.style.display = 'none';
      }
      return;
    }

    const num = Number(val);
    if (isNaN(num) || num < 20) {
      lotAreaNotice.style.display = 'flex';
      lotAreaNotice.className = 'setup-inline-notice error';
      lotAreaNotice.innerHTML = '<span class="notice-icon">⚠️</span><span class="notice-text">Lot area must be at least 20 sqm.</span>';
    } else {
      lotAreaNotice.style.display = 'flex';
      lotAreaNotice.className = 'setup-inline-notice valid';
      lotAreaNotice.innerHTML = '<span class="notice-icon">✓</span><span class="notice-text">Lot area is valid (min. 20 sqm met).</span>';
      if (!isFocused) {
        setTimeout(() => {
          if (document.activeElement !== areaInput && Number(areaInput.value.trim()) >= 20) {
            lotAreaNotice.style.display = 'none';
          }
        }, 1200);
      }
    }
  }

  if (areaInput) {
    areaInput.addEventListener('focus', () => updateLotAreaNotice(true));
    areaInput.addEventListener('input', () => updateLotAreaNotice(true));
    areaInput.addEventListener('blur', () => updateLotAreaNotice(false));
  }

  // Budget formatting
  budgetInput.addEventListener("input", function () {
    const originalValue = this.value;
    const selectionStart = this.selectionStart;
    const digitsBeforeCursor = originalValue
      .slice(0, selectionStart)
      .replace(/[^\d]/g, "").length;

    const formatted = formatBudgetValue(originalValue.replace(/[^\d]/g, ""));
    this.value = formatted;

    let newPos = 0;
    let seen = 0;
    while (newPos < formatted.length && seen < digitsBeforeCursor) {
      if (formatted[newPos] !== ",") seen++;
      newPos++;
    }
    this.setSelectionRange(newPos, newPos);
  });

  budgetInput.addEventListener("blur", function () {
    this.value = formatBudgetValue(this.value.replace(/[^\d]/g, ""));
  });

  // Handle form submit
  let chosenMode = 'manual';
  
  btnAi.addEventListener('click', () => chosenMode = 'ai');
  btnManual.addEventListener('click', () => chosenMode = 'manual');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const area = document.getElementById('setupArea').value;
    const areaNum = Number(area);

    if (!area || isNaN(areaNum) || areaNum < 20) {
      updateLotAreaNotice(true);
      if (lotAreaNotice) {
        lotAreaNotice.style.display = 'flex';
        lotAreaNotice.className = 'setup-inline-notice error';
        lotAreaNotice.innerHTML = '<span class="notice-icon">⚠️</span><span class="notice-text">Please enter a lot area of at least 20 sqm to proceed.</span>';
      }
      if (areaInput) areaInput.focus();
      return;
    }

    const budgetRaw = budgetInput.value.replace(/,/g, '');
    const location = document.getElementById('setupLocation').value;
    
    // Get radio button value for land type
    let landType = 'Flat';
    const landRadios = document.getElementsByName('landType');
    for (const radio of landRadios) {
      if (radio.checked) {
        landType = radio.value;
        break;
      }
    }

    if (!budgetRaw || Number(budgetRaw) < 50000) {
      alert("Please enter a budget of at least ₱50,000 to proceed.");
      return;
    }

    const setupData = {
      area: Number(area),
      budget: Number(budgetRaw),
      location: location,
      landType: landType,
      mode: chosenMode
    };

    localStorage.setItem('buildwiseSetup', JSON.stringify(setupData));

    // Redirect to designs page
    window.location.href = 'designs.html';
  });
}

document.addEventListener('DOMContentLoaded', initSetupForm);

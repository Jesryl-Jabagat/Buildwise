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
  const budgetInput = document.getElementById('setupBudget');
  const btnAi = document.getElementById('btnAi');
  const btnManual = document.getElementById('btnManual');

  if (!form) return;

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

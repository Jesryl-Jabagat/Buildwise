import { PRICES, refreshCustomPrices } from './estimator/prices.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('settings-container');
    const form = document.getElementById('settings-form');
    const btnReset = document.getElementById('btn-reset');
    const toastContainer = document.getElementById('toast-container');
    
    // A simple categorizer for the settings page (since PRICES is flat)
    const categories = {
        "Ceiling": ["Ceiling Board", "Wall Angle", "Carrying Channel", "Furring", "Rivets", "Insulation"],
        "Electrical Materials": ["Electrical Conduit", "Flexible Hose", "PVC Fittings", "THHN", "Switches", "Outlets", "Lighting", "Panel Board", "Electrical Tape"],
        "Walling / Light Framing": ["Amakan", "Cladding", "Tube", "Fiber Cement", "Gypsum", "PVC Board", "Plywood"],
        "Structural / Masonry": ["CHB 4-inch", "Cement", "Screened Sand", "Fine Sand", "Gravel", "Deformed Bar", "Wire", "Phenolic Board", "Lumber", "Excavation", "Poisoning", "Formworks"],
        "Roofing": ["Corrugated", "Long Span", "Spandrel", "Polycarbonate", "Metal Stone", "C-Purlin", "Ridge", "Gutter", "Tekscrew", "Washer", "Silicone", "Roofing Screw"],
        "Finishes": ["Floor Tile", "Tile Adhesive", "Primer", "Putty", "Topcoat Paint", "Paint Brush", "Paint Thinner", "Sandpaper"],
        "Doors, Windows & Stairs": ["Door", "Lockset", "Hinges", "Window", "Handrail", "Newel Post"],
        "Plumbing Materials": ["PVC Orange", "PPR", "Sanitary Fittings", "Water Supply", "Solvent", "Water Closet", "Lavatory", "Kitchen Sink", "Shower", "Faucet", "Floor Drain", "Septic"]
    };

    function getCategory(materialName) {
        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(kw => materialName.includes(kw))) {
                return cat;
            }
        }
        return "Other Materials";
    }

    // Group items by category
    const groupedPrices = {};
    for (const [name, data] of Object.entries(PRICES)) {
        const cat = getCategory(name);
        if (!groupedPrices[cat]) {
            groupedPrices[cat] = [];
        }
        groupedPrices[cat].push({ name, ...data });
    }

    // Load custom prices from localStorage
    let customPrices = {};
    try {
        const customData = localStorage.getItem('buildwise-custom-prices');
        if (customData) {
            customPrices = JSON.parse(customData);
        }
    } catch(e) {
        console.warn("Could not load custom prices", e);
    }

    // Render the UI
    for (const [cat, items] of Object.entries(groupedPrices)) {
        const card = document.createElement('div');
        card.className = 'settings-card';
        
        const title = document.createElement('h2');
        title.textContent = cat;
        card.appendChild(title);
        
        const grid = document.createElement('div');
        grid.className = 'settings-grid';
        
        items.forEach(item => {
            const field = document.createElement('div');
            field.className = 'price-field';
            
            const currentValue = customPrices[item.name] !== undefined ? customPrices[item.name] : item.price;
            const safeId = item.name.replace(/[^a-zA-Z0-9]/g, '_');
            const safeNameAttr = item.name.replace(/"/g, '&quot;');
            const isModified = currentValue !== item.price;
            
            field.innerHTML = `
                <label for="price_${safeId}">${item.name}</label>
                <div class="input-group ${isModified ? 'modified' : ''}">
                    <span class="input-prefix">₱</span>
                    <input type="number" step="0.01" min="0" id="price_${safeId}" data-material="${safeNameAttr}" value="${currentValue}">
                    <span class="input-suffix">per ${item.unit}</span>
                </div>
            `;
            grid.appendChild(field);
        });
        
        card.appendChild(grid);
        container.appendChild(card);
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        // Trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Add input event listener to toggle .modified class dynamically
    container.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            const material = e.target.getAttribute('data-material');
            const val = parseFloat(e.target.value);
            const inputGroup = e.target.closest('.input-group');
            if (inputGroup) {
                if (!isNaN(val) && val !== PRICES[material].price) {
                    inputGroup.classList.add('modified');
                } else {
                    inputGroup.classList.remove('modified');
                }
            }
        }
    });

    // Save Logic
    const btnSave = document.getElementById('btn-save');
    btnSave.addEventListener('click', (e) => {
        e.preventDefault();
        
        const newCustomPrices = {};
        const inputs = container.querySelectorAll('input[type="number"]');
        
        let hasErrors = false;
        inputs.forEach(input => {
            const material = input.getAttribute('data-material');
            const val = parseFloat(input.value);
            const inputGroup = input.closest('.input-group');
            
            if (isNaN(val) || val < 0) {
                inputGroup.style.borderColor = 'red';
                hasErrors = true;
            } else {
                inputGroup.style.borderColor = '';
                // Only save if it differs from default
                if (val !== PRICES[material].price) {
                    newCustomPrices[material] = val;
                }
            }
        });
        
        if (hasErrors) {
            showToast("Please fix invalid prices (must be 0 or greater).");
            return;
        }
        
        localStorage.setItem('buildwise-custom-prices', JSON.stringify(newCustomPrices));
        refreshCustomPrices();
        
        // Immediate visual feedback on the button itself
        const originalText = btnSave.textContent;
        btnSave.textContent = "✔ SAVED!";
        btnSave.style.backgroundColor = "#28a745"; // Success green
        
        setTimeout(() => {
            btnSave.textContent = originalText;
            btnSave.style.backgroundColor = "";
        }, 2000);

        showToast("Settings Saved Successfully!");
    });
    
    // Reset Logic
    btnReset.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all prices to their default values?")) {
            localStorage.removeItem('buildwise-custom-prices');
            refreshCustomPrices();
            
            // Update UI
            const inputs = container.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                const material = input.getAttribute('data-material');
                input.value = PRICES[material].price;
                const inputGroup = input.closest('.input-group');
                if (inputGroup) {
                    inputGroup.style.borderColor = '';
                    inputGroup.classList.remove('modified');
                }
            });
            
            showToast("Prices reset to defaults.");
        }
    });
});

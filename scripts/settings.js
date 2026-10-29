import { DEFAULT_TIER_CATALOG, getEffectiveCatalog, syncMaterialsFromDb, refreshCustomPrices } from './estimator/prices.js';
import { DEFAULT_LABOR_RATES, DEFAULT_LABOR_MULTIPLIERS, refreshCustomLabor } from './estimator/labor.js';
import { DEFAULT_TOOLS_LIST, getEffectiveTools, syncToolsFromDb, refreshCustomTools } from './estimator/tools.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('settings-container');
    const toastContainer = document.getElementById('toast-container');
    const btnReset = document.getElementById('btn-reset');
    const btnSave = document.getElementById('btn-save');

    // Make sure we have the latest materials and tools from Neon / local cache
    await Promise.all([
        syncMaterialsFromDb().catch(() => {}),
        syncToolsFromDb().catch(() => {})
    ]);
    let currentCatalog = getEffectiveCatalog();
    let currentTools = getEffectiveTools();

    // Load custom labor from localStorage
    let customLabor = { rates: {}, multipliers: {} };
    try {
        const laborData = localStorage.getItem('buildwise-custom-labor');
        if (laborData) {
            customLabor = JSON.parse(laborData);
            if (!customLabor.rates) customLabor.rates = {};
            if (!customLabor.multipliers) customLabor.multipliers = {};
        }
    } catch(e) {
        console.warn("Could not load custom labor", e);
    }

    // State
    let activeTab = 'tiers'; // 'tiers' | 'labor' | 'tools'
    let searchTerm = '';
    let toolSearchTerm = '';

    function showToast(msg) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.textContent = msg;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    function renderView() {
        container.innerHTML = '';

        // Render Tabs
        const tabsWrap = document.createElement('div');
        tabsWrap.className = 'tier-tabs';
        tabsWrap.innerHTML = `
            <button type="button" class="tier-tab-btn ${activeTab === 'tiers' ? 'active' : ''}" data-tab="tiers">
                🧱 Material Tiers & Brands (${Object.keys(currentCatalog).length})
            </button>
            <button type="button" class="tier-tab-btn ${activeTab === 'labor' ? 'active' : ''}" data-tab="labor">
                👷 Labor Wages & Rates
            </button>
            <button type="button" class="tier-tab-btn ${activeTab === 'tools' ? 'active' : ''}" data-tab="tools">
                🔧 Tools & Equipment (${currentTools.length})
            </button>
        `;
        tabsWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('.tier-tab-btn');
            if (btn) {
                activeTab = btn.getAttribute('data-tab');
                renderView();
            }
        });
        container.appendChild(tabsWrap);

        if (activeTab === 'tiers') {
            renderTiersView();
        } else if (activeTab === 'labor') {
            renderLaborView();
        } else if (activeTab === 'tools') {
            renderToolsView();
        }
    }

    function renderTiersView() {
        // Search and Actions
        const topBar = document.createElement('div');
        topBar.className = 'top-action-bar';
        topBar.innerHTML = `
            <div class="search-bar-wrap" style="flex:1; margin-bottom:0;">
                <input type="text" id="material-search" placeholder="🔍 Search material name, brand, or category..." value="${searchTerm}">
            </div>
        `;
        container.appendChild(topBar);

        const searchInput = topBar.querySelector('#material-search');
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            filterTiersRows();
        });

        // Group materials by category
        const grouped = {};
        for (const [key, item] of Object.entries(currentCatalog)) {
            const cat = item.category || "General Materials";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push({ key, ...item });
        }

        const catalogCard = document.createElement('div');
        catalogCard.className = 'settings-card';
        catalogCard.id = 'tier-catalog-content';

        const cardHeader = document.createElement('div');
        cardHeader.innerHTML = `
            <h2>Materials & Brands Catalog</h2>
            <p style="color:var(--color-muted); font-size:0.9rem; margin-bottom: 20px;">
                Configure exact brands and unit prices for each tier (Basic, Standard, Premium). These are saved directly to your Neon Database and cached locally.
            </p>
        `;
        catalogCard.appendChild(cardHeader);

        for (const [catName, items] of Object.entries(grouped)) {
            const catHeader = document.createElement('h3');
            catHeader.style.cssText = 'color:var(--color-accent); font-size:1.15rem; margin: 25px 0 12px; border-bottom: 1px dashed var(--color-border); padding-bottom: 6px;';
            catHeader.textContent = `📁 ${catName}`;
            catHeader.className = 'cat-section-title';
            catalogCard.appendChild(catHeader);

            const catList = document.createElement('div');
            catList.className = 'cat-items-list';

            items.forEach(item => {
                const row = document.createElement('div');
                row.className = 'tier-item-row';
                row.setAttribute('data-material-key', item.key);
                row.setAttribute('data-search-text', `${item.key} ${catName} ${item.Basic?.brand || ''} ${item.Standard?.brand || ''} ${item.Premium?.brand || ''}`.toLowerCase());

                row.innerHTML = `
                    <div class="tier-item-header">
                        <span class="tier-item-title">${item.key}</span>
                        <span class="tier-item-meta">${catName} • [${item.unit || 'unit'}]</span>
                    </div>
                    <div class="tier-columns-grid">
                        <!-- BASIC TIER -->
                        <div class="tier-column-box tier-basic">
                            <div class="tier-badge">
                                <span>Basic Tier</span>
                                <span>Economy</span>
                            </div>
                            <input type="text" class="tier-input-brand" placeholder="Brand / Grade Name" 
                                data-key="${item.key}" data-tier="Basic" data-field="brand" value="${item.Basic?.brand || ''}">
                            <div class="tier-input-price-wrap">
                                <span>₱</span>
                                <input type="number" step="0.01" min="0" placeholder="0.00" 
                                    data-key="${item.key}" data-tier="Basic" data-field="price" value="${item.Basic?.price || 0}">
                            </div>
                        </div>

                        <!-- STANDARD TIER -->
                        <div class="tier-column-box tier-standard">
                            <div class="tier-badge">
                                <span>Standard Tier</span>
                                <span>Default</span>
                            </div>
                            <input type="text" class="tier-input-brand" placeholder="Brand / Grade Name" 
                                data-key="${item.key}" data-tier="Standard" data-field="brand" value="${item.Standard?.brand || ''}">
                            <div class="tier-input-price-wrap">
                                <span>₱</span>
                                <input type="number" step="0.01" min="0" placeholder="0.00" 
                                    data-key="${item.key}" data-tier="Standard" data-field="price" value="${item.Standard?.price || 0}">
                            </div>
                        </div>

                        <!-- PREMIUM TIER -->
                        <div class="tier-column-box tier-premium">
                            <div class="tier-badge">
                                <span>Premium Tier</span>
                                <span>Heavy-Duty</span>
                            </div>
                            <input type="text" class="tier-input-brand" placeholder="Brand / Grade Name" 
                                data-key="${item.key}" data-tier="Premium" data-field="brand" value="${item.Premium?.brand || ''}">
                            <div class="tier-input-price-wrap">
                                <span>₱</span>
                                <input type="number" step="0.01" min="0" placeholder="0.00" 
                                    data-key="${item.key}" data-tier="Premium" data-field="price" value="${item.Premium?.price || 0}">
                            </div>
                        </div>
                    </div>
                `;
                catList.appendChild(row);
            });

            catalogCard.appendChild(catList);
        }

        container.appendChild(catalogCard);
        filterTiersRows();
    }

    function filterTiersRows() {
        const rows = container.querySelectorAll('.tier-item-row');
        rows.forEach(row => {
            const text = row.getAttribute('data-search-text') || '';
            if (!searchTerm || text.includes(searchTerm)) {
                row.style.display = 'block';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function renderLaborView() {
        // Daily wages card
        const wageCard = document.createElement('div');
        wageCard.className = 'settings-card labor-settings-card';
        wageCard.innerHTML = `<h2>Daily Labor Wages</h2><div class="settings-grid" id="labor-wage-grid"></div>`;
        const wageGrid = wageCard.querySelector('#labor-wage-grid');

        for (const [key, defaultVal] of Object.entries(DEFAULT_LABOR_RATES)) {
            const curVal = customLabor.rates[key] !== undefined ? customLabor.rates[key] : defaultVal;
            const field = document.createElement('div');
            field.className = 'price-field';
            field.innerHTML = `
                <label>${key}</label>
                <div class="input-group ${curVal !== defaultVal ? 'modified' : ''}">
                    <span class="input-prefix">₱</span>
                    <input type="number" step="1" min="0" data-labor-rate="${key}" value="${curVal}">
                    <span class="input-suffix">per day</span>
                </div>
            `;
            wageGrid.appendChild(field);
        }
        container.appendChild(wageCard);

        // Multipliers card
        const multCard = document.createElement('div');
        multCard.className = 'settings-card labor-settings-card';
        multCard.innerHTML = `<h2>Labor Cost Multipliers</h2><div class="settings-grid" id="labor-mult-grid"></div>`;
        const multGrid = multCard.querySelector('#labor-mult-grid');

        for (const [key, defaultVal] of Object.entries(DEFAULT_LABOR_MULTIPLIERS)) {
            const curVal = customLabor.multipliers[key] !== undefined ? customLabor.multipliers[key] : defaultVal;
            const field = document.createElement('div');
            field.className = 'price-field';
            field.innerHTML = `
                <label>${key}</label>
                <div class="input-group ${curVal !== defaultVal ? 'modified' : ''}">
                    <input type="number" step="1" min="0" data-labor-mult="${key}" value="${(curVal * 100).toFixed(0)}">
                    <span class="input-suffix">% of materials</span>
                </div>
            `;
            multGrid.appendChild(field);
        }
        container.appendChild(multCard);
    }

    function renderToolsView() {
        // Top search bar
        const topBar = document.createElement('div');
        topBar.className = 'top-action-bar';
        topBar.innerHTML = `
            <div class="search-bar-wrap" style="flex:1; margin-bottom:0;">
                <input type="text" id="tool-search" placeholder="🔍 Search tool name or category..." value="${toolSearchTerm}">
            </div>
        `;
        container.appendChild(topBar);

        const searchInput = topBar.querySelector('#tool-search');
        searchInput.addEventListener('input', (e) => {
            toolSearchTerm = e.target.value.toLowerCase();
            filterToolRows();
        });

        const toolsCard = document.createElement('div');
        toolsCard.className = 'settings-card';
        toolsCard.id = 'tools-catalog-content';

        toolsCard.innerHTML = `
            <h2>🔧 Construction Tools & Equipment</h2>
            <p style="color:var(--color-muted); font-size:0.9rem; margin-bottom: 20px;">
                Manage unit prices for tools and equipment used in the project. These prices are applied when the <strong>Include Tools & Equipment</strong> option is enabled in house configurations.
            </p>
        `;

        // Group tools by category
        const grouped = {};
        currentTools.forEach(tool => {
            const cat = tool.category || 'General';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(tool);
        });

        for (const [catName, items] of Object.entries(grouped)) {
            const catHeader = document.createElement('h3');
            catHeader.style.cssText = 'color:var(--color-accent); font-size:1.15rem; margin: 25px 0 12px; border-bottom: 1px dashed var(--color-border); padding-bottom: 6px;';
            catHeader.textContent = `🛠️ ${catName}`;
            catHeader.className = 'cat-section-title';
            toolsCard.appendChild(catHeader);

            const catList = document.createElement('div');
            catList.className = 'cat-tools-list';

            items.forEach(tool => {
                const row = document.createElement('div');
                row.className = 'tool-item-row';
                row.setAttribute('data-tool-key', tool.tool_key);
                row.setAttribute('data-search-text', `${tool.tool_key} ${catName}`.toLowerCase());

                row.innerHTML = `
                    <div class="tool-item-info">
                        <span class="tool-item-title">${tool.tool_key}</span>
                        <span class="tool-item-category">${catName}</span>
                    </div>
                    <div class="tier-input-price-wrap tool-item-price-wrap">
                        <span>₱</span>
                        <input type="number" step="1" min="0" placeholder="0.00" 
                            data-tool-key="${tool.tool_key}" 
                            data-tool-id="${tool.id || ''}" 
                            value="${tool.unit_price}">
                    </div>
                `;
                catList.appendChild(row);
            });

            toolsCard.appendChild(catList);
        }

        container.appendChild(toolsCard);
        filterToolRows();
    }

    function filterToolRows() {
        const rows = container.querySelectorAll('.tool-item-row');
        rows.forEach(row => {
            const text = row.getAttribute('data-search-text') || '';
            if (!toolSearchTerm || text.includes(toolSearchTerm)) {
                row.style.display = 'flex';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Save All Changes (Updates Database + LocalStorage)
    btnSave.addEventListener('click', async (e) => {
        e.preventDefault();
        const origText = btnSave.textContent;
        btnSave.disabled = true;
        btnSave.textContent = "Saving to Database...";

        try {
            // 1. Gather Tiers updates
            const tierInputs = container.querySelectorAll('[data-tier]');
            const updatedItemsMap = {};

            tierInputs.forEach(input => {
                const key = input.getAttribute('data-key');
                const tier = input.getAttribute('data-tier');
                const field = input.getAttribute('data-field');

                if (!updatedItemsMap[key]) {
                    updatedItemsMap[key] = {
                        material_key: key,
                        Basic: { ...currentCatalog[key]?.Basic },
                        Standard: { ...currentCatalog[key]?.Standard },
                        Premium: { ...currentCatalog[key]?.Premium }
                    };
                }

                if (field === 'price') {
                    updatedItemsMap[key][tier].price = parseFloat(input.value) || 0;
                } else if (field === 'brand') {
                    updatedItemsMap[key][tier].brand = input.value.trim();
                }
            });

            // Update currentCatalog in memory & localStorage
            for (const [key, data] of Object.entries(updatedItemsMap)) {
                if (currentCatalog[key]) {
                    currentCatalog[key].Basic = data.Basic;
                    currentCatalog[key].Standard = data.Standard;
                    currentCatalog[key].Premium = data.Premium;

                    // Sync to Neon Database via PUT /api/materials
                    fetch('/api/materials', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            material_key: key,
                            basic_brand: data.Basic.brand,
                            basic_price: data.Basic.price,
                            standard_brand: data.Standard.brand,
                            standard_price: data.Standard.price,
                            premium_brand: data.Premium.brand,
                            premium_price: data.Premium.price
                        })
                    }).catch(err => console.warn(`Error syncing ${key} to DB:`, err));
                }
            }

            localStorage.setItem('buildwise-materials-catalog', JSON.stringify(currentCatalog));
            refreshCustomPrices();

            // 2. Gather Labor updates
            const newCustomLabor = { rates: {}, multipliers: {} };
            const laborRateInputs = container.querySelectorAll('[data-labor-rate]');
            laborRateInputs.forEach(input => {
                const role = input.getAttribute('data-labor-rate');
                const val = parseFloat(input.value) || 0;
                if (val !== DEFAULT_LABOR_RATES[role]) {
                    newCustomLabor.rates[role] = val;
                }
            });

            const laborMultInputs = container.querySelectorAll('[data-labor-mult]');
            laborMultInputs.forEach(input => {
                const type = input.getAttribute('data-labor-mult');
                const val = (parseFloat(input.value) || 0) / 100;
                if (val !== DEFAULT_LABOR_MULTIPLIERS[type]) {
                    newCustomLabor.multipliers[type] = val;
                }
            });

            localStorage.setItem('buildwise-custom-labor', JSON.stringify(newCustomLabor));
            refreshCustomLabor();

            // 3. Gather Tools updates
            const toolPriceInputs = container.querySelectorAll('input[data-tool-key]');
            if (toolPriceInputs.length > 0) {
                toolPriceInputs.forEach(input => {
                    const toolKey = input.getAttribute('data-tool-key');
                    const toolId = input.getAttribute('data-tool-id');
                    const price = parseFloat(input.value) || 0;
                    
                    const existingTool = currentTools.find(t => t.tool_key === toolKey);
                    if (existingTool) {
                        existingTool.unit_price = price;
                    }

                    // Background sync to database
                    fetch('/api/tools', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: toolId || undefined,
                            tool_key: toolKey,
                            unit_price: price
                        })
                    }).catch(err => console.warn(`Error syncing tool ${toolKey} to DB:`, err));
                });

                localStorage.setItem('buildwise-tools-catalog', JSON.stringify(currentTools));
                refreshCustomTools();
            }

            btnSave.textContent = "✔ SAVED!";
            btnSave.style.backgroundColor = "#28a745";
            showToast("Settings (Materials, Labor & Tools) saved successfully!");

            setTimeout(() => {
                btnSave.textContent = origText;
                btnSave.style.backgroundColor = "";
                btnSave.disabled = false;
            }, 2000);
        } catch (err) {
            console.error("Save error:", err);
            showToast("Failed to save changes: " + err.message);
            btnSave.textContent = origText;
            btnSave.disabled = false;
        }
    });

    // Reset Defaults
    btnReset.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all material tiers, labor settings, and tool prices back to default baseline values?")) {
            localStorage.removeItem('buildwise-materials-catalog');
            localStorage.removeItem('buildwise-custom-labor');
            localStorage.removeItem('buildwise-tools-catalog');
            refreshCustomPrices();
            refreshCustomLabor();
            refreshCustomTools();
            currentCatalog = { ...DEFAULT_TIER_CATALOG };
            currentTools = [...DEFAULT_TOOLS_LIST];
            renderView();
            showToast("All settings reset to defaults.");
        }
    });

    // Initial render
    renderView();
});

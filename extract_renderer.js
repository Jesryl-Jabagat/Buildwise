const fs = require('fs');

const html = fs.readFileSync('imageRenderer/index.html', 'utf8');
const scriptMatch = html.match(/<script>\s*([\s\S]*?)<\/script>/g);
let jsCode = scriptMatch[scriptMatch.length - 1]; 
jsCode = jsCode.replace('<script>', '').replace('</script>', '');

// 1. Remove standalone UI logic
jsCode = jsCode.replace(/\/\/ ============================================================[\s\S]*?\/\/  THREE\.JS SCENE SETUP/g, '//  THREE.JS SCENE SETUP');

// 2. Fix texture paths
jsCode = jsCode.replace(/'amakan skin.png'/g, "'../assets/amakan skin.png'");

// 3. Fix getVal calls inside buildHouse
let buildHouseLogic = `
function buildHouseLogic(configData) {
    clearGroup(wallGroup);
    clearGroup(roofGroup);
    clearGroup(slabGroup);
    clearGroup(columnGroup);
    clearGroup(blueprintGroup);

    const type       = configData.typeKey || 'CHB';
    const fl         = configData.floorArea || 80;
    const W          = Math.max(3, Math.floor(Math.sqrt(fl * 0.75)));
    const L          = Math.max(4, fl / W);
    const L2         = L / 2;
    const W2         = W;
    const H1         = type === 'Two Storey' ? 3.0 : (type.includes('Half') ? 1.5 : 3.0);
    const H2         = 2.8;
    const plastering = configData.finishLevel !== 'Bare structural shell';
    const painting   = configData.finishLevel === 'Premium finish' || configData.finishLevel === 'Balanced family comfort';
    const paintColor = '#E8E4DC';
    const plastering2= plastering;
    const painting2  = painting;
    const paintColor2= paintColor;
    const hasCeiling = true;
    const applyTiles = plastering;
    const applyTiles2= applyTiles;
    const roofType   = configData.roofStyle || 'Corrugated GI Sheet / Yero';

    const getVal = (id, def) => {
        if (id === 'bed1') return Math.max(1, configData.bedrooms || 1);
        if (id === 'cr1') return Math.max(1, configData.bathrooms || 1);
        if (id === 'bed2') return (configData.bedrooms > 2 ? 2 : 0);
        if (id === 'cr2') return (configData.bathrooms > 1 ? 1 : 0);
        if (id === 'wallType') return 'Metal Cladding Sheets';
        if (id === 'hasCeiling2') return true;
        return def;
    };
`;
jsCode = jsCode.replace(/function buildHouse\(\) \{[\s\S]*?\/\/ --- MATERIALS ---/g, buildHouseLogic + '\n    // --- MATERIALS ---');

// 4. Fix DOM lookups
jsCode = jsCode.replace(/document\.getElementById\('houseType'\)\.value/g, "window.currentRendererHouseType");

// 5. Remove event listeners for UI (xray-toggles, etc.)
jsCode = jsCode.replace(/document\.querySelectorAll\('.xray-toggle'\)[\s\S]*?function updateVis\(\) \{[\s\S]*?\}/, '');

// 6. Remove the boot block at the end
jsCode = jsCode.replace(/buildHouse\(\);\s*updateVis\(\);\s*animate\(\);/g, '');

// 7. Wrap in exported initRenderer
let finalCode = `
export function initRenderer(configData) {
    window.currentRendererHouseType = configData.typeKey || 'CHB';
    
    // Prevent re-initialization if called multiple times
    const extContainer = document.getElementById('exterior-container');
    if (!extContainer || extContainer.children.length > 2) return; 

    ${jsCode}

    // Default visibility
    roofGroup.visible = true;
    wallGroup.visible = true;
    slabGroup.visible = true;
    columnGroup.visible = true;

    buildHouseLogic(configData);
    animate();
}
`;

fs.writeFileSync('scripts/result/renderer3d.js', finalCode);
console.log('Successfully generated scripts/result/renderer3d.js');

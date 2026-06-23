
const mapType = (tk) => {
    switch(tk) {
        case 'half-amakan': return 'Half Amakan';
        case 'half-metal': return 'Half Metal';
        case 'loft': return 'Loft Style';
        case 'two-storey': return 'Two Storey';
        default: return 'CHB';
    }
};

const mapPaintColor = (theme) => {
    if (!theme) return '#E8E4DC';
    if (theme.includes('Classic White')) return '#F0F0F0';
    if (theme.includes('Cream')) return '#E8E4DC';
    if (theme.includes('Earth Tones')) return '#C8A288';
    if (theme.includes('Cool Neutrals')) return '#B0B8C0';
    if (theme.includes('Pastel')) return '#C1D3E0';
    if (theme.includes('Tropical')) return '#FFF9D2';
    if (theme.includes('Modern Minimalist')) return '#FFFFFF';
    return '#E8E4DC';
};

export function initRenderer(configData) {
    window.currentRendererHouseType = mapType(configData.typeKey);
    
    // Prevent re-initialization if called multiple times
    const extContainer = document.getElementById('exterior-container');
    if (!extContainer || extContainer.children.length > 2) return; 

    
//  THREE.JS SCENE SETUP
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

// Hemisphere light for realistic sky/ground bounce
const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4a7c4a, 0.6);
scene.add(hemiLight);

// Primary sun
const sunLight = new THREE.DirectionalLight(0xfff4e0, 1.1);
sunLight.position.set(20, 30, 15);
sunLight.castShadow = false;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -25;
sunLight.shadow.camera.right = 25;
sunLight.shadow.camera.top = 25;
sunLight.shadow.camera.bottom = -25;
sunLight.shadow.bias = -0.0003;
scene.add(sunLight);

// Soft fill light from opposite side
const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.35);
fillLight.position.set(-15, 15, -10);
scene.add(fillLight);

// ============================================================
//  ENVIRONMENT
// ============================================================
function makeGround() {
    const lawnGeo = new THREE.PlaneGeometry(60, 60);
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x4a8c4a, roughness: 1.0 });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.receiveShadow = true;
    scene.add(lawn);
}
makeGround();

function makeTree(x, z, h) {
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.22, h * 0.4, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 1 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, h * 0.2, z);
    trunk.castShadow = true;
    scene.add(trunk);
    const topGeo = new THREE.SphereGeometry(h * 0.3, 8, 6);
    const topMat = new THREE.MeshStandardMaterial({ color: 0x2d6e2d, roughness: 1 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(x, h * 0.55, z);
    top.castShadow = true;
    scene.add(top);
}
// Trees removed per user request

// ============================================================
//  RENDERERS
// ============================================================
// extContainer already declared above
const cameraExt = new THREE.PerspectiveCamera(45, extContainer.clientWidth / extContainer.clientHeight, 0.1, 500);
cameraExt.position.set(25, 4, 0);

const rendererExt = new THREE.WebGLRenderer({ antialias: true });
rendererExt.setSize(extContainer.clientWidth, extContainer.clientHeight);
rendererExt.setPixelRatio(window.devicePixelRatio);
rendererExt.shadowMap.enabled = false;
rendererExt.shadowMap.type = THREE.PCFSoftShadowMap;
rendererExt.toneMapping = THREE.ACESFilmicToneMapping;
rendererExt.toneMappingExposure = 1.0;
extContainer.appendChild(rendererExt.domElement);

const controlsExt = new THREE.OrbitControls(cameraExt, rendererExt.domElement);
controlsExt.enableDamping = true;
controlsExt.dampingFactor = 0.05;
controlsExt.maxPolarAngle = Math.PI / 2 - 0.02;
controlsExt.target.set(0, 3.0, 0);

// Floor plan (orthographic)
const fpContainer = document.getElementById('floorplan-container');
const fpAspect = fpContainer.clientWidth / fpContainer.clientHeight;
const fpD = 8;
const cameraFP = new THREE.OrthographicCamera(-fpD*fpAspect, fpD*fpAspect, fpD, -fpD, 1, 150);
cameraFP.position.set(0, 50, 0);
cameraFP.lookAt(0, 0, 0);
cameraFP.up.set(-1, 0, 0);

const rendererFP = new THREE.WebGLRenderer({ antialias: true });
rendererFP.setSize(fpContainer.clientWidth, fpContainer.clientHeight);
rendererFP.setPixelRatio(window.devicePixelRatio);
rendererFP.shadowMap.enabled = false;
rendererFP.toneMapping = THREE.ACESFilmicToneMapping;
rendererFP.toneMappingExposure = 1.0;
fpContainer.appendChild(rendererFP.domElement);

const controlsFP = new THREE.OrbitControls(cameraFP, rendererFP.domElement);
controlsFP.enableRotate = false;
controlsFP.enableDamping = true;
controlsFP.dampingFactor = 0.05;

// ============================================================
//  MESH GROUPS
// ============================================================
const houseGroup  = new THREE.Group();
const wallGroup   = new THREE.Group();
const roofGroup   = new THREE.Group();
const slabGroup   = new THREE.Group();
const columnGroup = new THREE.Group();
const blueprintGroup = new THREE.Group(); // For 2D floor plan symbols

houseGroup.add(wallGroup, roofGroup, slabGroup, columnGroup, blueprintGroup);
scene.add(houseGroup);

// Blueprint Materials
const fpWallMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const fpSlabMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const fpWindowMat = new THREE.MeshBasicMaterial({ color: 0xc8d8e8 });
const fpLineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

// ============================================================
//  TEXTURE GENERATORS
// ============================================================
function makeCHBTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#b0a898'; ctx.fillRect(0,0,512,512);
    ctx.strokeStyle = '#8a8070'; ctx.lineWidth = 6;
    const rowH = 80;
    const blkW = 160;
    for(let y=0;y<=512;y+=rowH){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke(); }
    for(let row=0;row<512/rowH;row++){
        const off = row%2===0?0:blkW/2;
        for(let x=-blkW;x<=512;x+=blkW){ ctx.beginPath();ctx.moveTo(x+off,row*rowH);ctx.lineTo(x+off,(row+1)*rowH);ctx.stroke(); }
    }
    const t = new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,2); return t;
}
function makeAmakanTex() {
    const c = document.createElement('canvas'); c.width=256; c.height=256;
    const ctx = c.getContext('2d');
    ctx.fillStyle='#c8a86e'; ctx.fillRect(0,0,256,256);
    ctx.strokeStyle='#9a7040'; ctx.lineWidth=2;
    for(let i=0;i<=256;i+=18){ ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,256);ctx.stroke(); ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(256,i);ctx.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(4,4); return t;
}
function makeMetalTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    
    // Base color (Beige/Tan)
    const baseColor = '#C8B291';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);
    
    // Pattern: Wide flat area with 2 micro-ribs, then a large raised trapezoidal rib
    const unit = 128; // 4 units per 512px
    const ribW = 28;  // Width of the main raised rib
    
    for (let x = 0; x < 512; x += unit) {
        // --- 1. Two faint micro-ribs in the flat area ---
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // highlight
        ctx.fillRect(x + 30, 0, 2, 512);
        ctx.fillRect(x + 60, 0, 2, 512);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // shadow
        ctx.fillRect(x + 32, 0, 3, 512);
        ctx.fillRect(x + 62, 0, 3, 512);
        
        // --- 2. Main raised trapezoidal rib ---
        const ribStart = x + unit - ribW;
        
        // Left sloped edge (highlighted by light)
        ctx.fillStyle = '#E0CCAB';
        ctx.fillRect(ribStart, 0, 6, 512);
        
        // Flat top of the rib
        ctx.fillStyle = '#D0BCA0';
        ctx.fillRect(ribStart + 6, 0, ribW - 12, 512);
        
        // Right sloped edge (in shadow)
        ctx.fillStyle = '#A08866';
        ctx.fillRect(ribStart + ribW - 6, 0, 6, 512);
        
        // Deep shadow cast by the right edge onto the flat area
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(ribStart + ribW, 0, 4, 512);
    }
    
    const t = new THREE.CanvasTexture(c); 
    t.wrapS = t.wrapT = THREE.RepeatWrapping; 
    t.repeat.set(6, 1); 
    return t;
}
function makeRoofTex(color) {
    const c = document.createElement('canvas'); c.width=256; c.height=256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = color||'#3a3530'; ctx.fillRect(0,0,256,256);
    ctx.strokeStyle='rgba(0,0,0,0.18)'; ctx.lineWidth=3;
    for(let x=0;x<=256;x+=20){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,256);ctx.stroke(); } // Vertical ribs
    const t = new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(4,4); return t;
}
function makeTileTex() {
    const c = document.createElement('canvas'); c.width=256; c.height=256;
    const ctx = c.getContext('2d');
    ctx.fillStyle='#e8e0d0'; ctx.fillRect(0,0,256,256);
    ctx.strokeStyle='#c0b8a8'; ctx.lineWidth=2;
    for(let x=0;x<=256;x+=64){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,256);ctx.stroke(); }
    for(let y=0;y<=256;y+=64){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,3); return t;
}

function makeDynamicTileTex(tileSizeStr, L, W) {
    let sizeMeters = 0.3; // Default 30x30
    if (tileSizeStr) {
        const parts = String(tileSizeStr).split('x');
        if (parts.length > 0) {
            sizeMeters = parseFloat(parts[0]) / 100;
        }
    }
    if (isNaN(sizeMeters) || sizeMeters <= 0) sizeMeters = 0.3;

    const c = document.createElement('canvas'); c.width=256; c.height=256;
    const ctx = c.getContext('2d');
    ctx.fillStyle='#e8e0d0'; ctx.fillRect(0,0,256,256);
    ctx.strokeStyle='#c0b8a8'; ctx.lineWidth=2;
    for(let x=0;x<=256;x+=64){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,256);ctx.stroke(); }
    for(let y=0;y<=256;y+=64){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke(); }
    const t = new THREE.CanvasTexture(c); 
    t.wrapS=t.wrapT=THREE.RepeatWrapping; 
    
    const repX = L / (4 * sizeMeters);
    const repY = W / (4 * sizeMeters);
    t.repeat.set(repX, repY);
    
    return t;
}

function makeYeroTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const waveW = 32; // Wider wave in pixels
    for(let x=0; x<512; x++) {
        const wave = (Math.sin(x / waveW * Math.PI * 2) + 1) / 2;
        // Much higher contrast: deep dark grey valleys, bright white peaks
        const shade = Math.floor(60 + wave * 195); 
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade + 10})`; 
        ctx.fillRect(x, 0, 1, 512); 
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3); // Less repetition = much larger waves on the roof
    return t;
}

function makePlywoodTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#d4a373'; ctx.fillRect(0,0,512,512); 
    ctx.fillStyle = '#c89562';
    for(let i=0; i<200; i++) {
        const y = Math.random() * 512;
        const h = Math.random() * 3 + 1;
        ctx.fillRect(0, y, 512, h);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return t;
}

function makeHardiflexTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#e0e4e5'; ctx.fillRect(0,0,512,512); 
    ctx.fillStyle = '#d0d4d5';
    for(let i=0; i<3000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const s = Math.random() * 2 + 1;
        ctx.fillRect(x, y, s, s);
    }
    ctx.strokeStyle = '#c0c4c5'; ctx.lineWidth = 2;
    for(let x=0; x<=512; x+=128) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,512); ctx.stroke(); }
    for(let y=0; y<=512; y+=128) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(512,y); ctx.stroke(); }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return t;
}

const chbTex       = makeCHBTex();
const yeroTex      = makeYeroTex();
const plywoodTex   = makePlywoodTex();
const hardiflexTex = makeHardiflexTex();
const textureLoader = new THREE.TextureLoader();
const amakanTex = textureLoader.load('../assets/amakan skin.png');
amakanTex.wrapS = amakanTex.wrapT = THREE.RepeatWrapping;
amakanTex.repeat.set(4, 4);
const metalTex = makeMetalTex();
const roofTex   = makeRoofTex('#3a3530');
const tileTex   = makeTileTex();

// ============================================================
//  HELPERS
// ============================================================
// getVal removed (replaced by explicit configData mapping)

function clearGroup(g) {
    while(g.children.length) {
        const m = g.children[0];
        if(m.geometry) m.geometry.dispose();
        if(m.material) Array.isArray(m.material)?m.material.forEach(x=>x.dispose()):m.material.dispose();
        g.remove(m);
    }
}

function box(w,h,d,x,y,z,mat,grp,shadow=true, type="wall", layer=0) {
    const geo = new THREE.BoxGeometry(Math.max(0.01,w), Math.max(0.01,h), Math.max(0.01,d));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x,y,z);
    if(shadow){ mesh.castShadow=true; mesh.receiveShadow=true; }
    mesh.userData.type = type;
    mesh.layers.set(layer);
    if (layer !== 0) mesh.layers.enable(0);
    grp.add(mesh);
    return mesh;
}

function addBlueprintDoorSymbol(x, z, width, type, layer=0) {
    const y = 20;
    const group = new THREE.Group();
    
    let hx, hz, lx, lz, startAngle, endAngle;
    
    if (type === 'bed') {
        hx = x + width/2; hz = z;
        lx = hx; lz = hz - width; // leaf opens to -Z (UP)
        startAngle = Math.PI; endAngle = 1.5 * Math.PI;
    } else if (type === 'cr') {
        hx = x + width/2; hz = z;
        lx = hx; lz = hz + width; // leaf opens to +Z (DOWN)
        startAngle = Math.PI / 2; endAngle = Math.PI;
    } else if (type === 'front') {
        hx = x; hz = z + width/2;
        lx = hx - width; lz = hz; // leaf opens to -X (LEFT)
        startAngle = Math.PI; endAngle = 1.5 * Math.PI;
    }

    const leafGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(hx, y, hz), new THREE.Vector3(lx, y, lz)]);
    const leafLine = new THREE.Line(leafGeo, fpLineMat);
    leafLine.layers.set(layer); if(layer!==0) leafLine.layers.enable(0);
    
    const curve = new THREE.EllipseCurve(hx, hz, width, width, startAngle, endAngle, false, 0);
    const points = curve.getPoints(16).map(p => new THREE.Vector3(p.x, y, p.y));
    const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
    const arcLine = new THREE.Line(arcGeo, fpLineMat);
    arcLine.layers.set(layer); if(layer!==0) arcLine.layers.enable(0);
    
    group.add(leafLine, arcLine);
    blueprintGroup.add(group);
}

function addBlueprintWindowSymbol(x, z, width, axis, layer=0) {
    const y = 20.1;
    const group = new THREE.Group();
    
    // Background to "cut" the wall visually
    const bgGeo = (axis === 'Z') ? new THREE.BoxGeometry(0.15 + 0.05, 0.01, width) : new THREE.BoxGeometry(width, 0.01, 0.15 + 0.05);
    const bg = new THREE.Mesh(bgGeo, fpSlabMat); 
    bg.layers.set(layer); if(layer!==0) bg.layers.enable(0);
    group.add(bg);
    
    // Inner window panes
    const paneGeo = (axis === 'Z') ? new THREE.BoxGeometry(0.04, 0.02, width) : new THREE.BoxGeometry(width, 0.02, 0.04);
    const pane = new THREE.Mesh(paneGeo, fpWindowMat); 
    pane.layers.set(layer); if(layer!==0) pane.layers.enable(0);
    group.add(pane);
    
    // Outer frame outlines
    const edges = new THREE.EdgesGeometry(bgGeo);
    const line = new THREE.LineSegments(edges, fpLineMat);
    line.layers.set(layer); if(layer!==0) line.layers.enable(0);
    group.add(line);
    
    group.position.set(x, y, z);
    blueprintGroup.add(group);
}

function createTextSprite(message, layer=0) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3.5, 0.875, 1); // 4:1 aspect ratio
    sprite.layers.set(layer); if(layer!==0) sprite.layers.enable(0);
    return sprite;
}

function addStairs(cx, cz, sw, sd, h, mat, layer=0) {
    const numSteps = Math.ceil(h / 0.18);
    const stepH = h / numSteps;
    const stepD = sd / numSteps;
    
    // 3D Steps
    for (let i = 0; i < numSteps; i++) {
        const sz = cz + sd/2 - (i + 0.5) * stepD;
        const sy = (i + 0.5) * stepH;
        box(sw, stepH, stepD, cx, sy, sz, mat, wallGroup, true, "stair", layer);
    }
    
    // 2D Blueprint Symbol
    const group = new THREE.Group();
    
    // Stair bounding box
    const geo = new THREE.BoxGeometry(sw, 0.01, sd);
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, fpLineMat);
    line.layers.set(layer); if(layer!==0) line.layers.enable(0);
    group.add(line);
    
    // Add "STAIRS" text
    const upText = createTextSprite("STAIRS", layer);
    upText.scale.set(2.0, 0.5, 1);
    upText.position.set(0, 0, 0);
    group.add(upText);
    
    group.position.set(cx, 20, cz);
    blueprintGroup.add(group);
}

// ============================================================
//  MAIN BUILD FUNCTION
// ============================================================

function buildHouseLogic(configData) {
    clearGroup(wallGroup);
    clearGroup(roofGroup);
    clearGroup(slabGroup);
    clearGroup(columnGroup);
    clearGroup(blueprintGroup);

    const type       = mapType(configData.typeKey);
    const fl         = configData.floorArea || 80;
    const baseW      = Math.max(3, Math.floor(Math.sqrt(fl * 0.75)));
    const W          = parseFloat(configData.width) || baseW;
    const L          = parseFloat(configData.length) || Math.max(4, fl / baseW);
    let L2           = L / 2;
    let W2           = W;
    if (type === 'Two Storey') {
        L2 = parseFloat(configData.secondFloorLength) || L2;
        W2 = parseFloat(configData.secondFloorWidth) || W2;
    } else if (type === 'Loft Style') {
        L2 = parseFloat(configData.mezzanineLength) || L2;
        W2 = parseFloat(configData.mezzanineWidth) || W2;
    }
    const H1         = parseFloat(configData.wallHeight) || parseFloat(configData.groundWallHeight) || parseFloat(configData.chbBaseWallHeight) || (type === 'Two Storey' ? 3.0 : (type.includes('Half') ? 1.5 : 3.0));
    const H2         = 2.8;
    const isTrue = (val) => val === true || val === 'Yes';
    const plastering = isTrue(configData.includePlastering) || isTrue(configData.plasterGroundFloor);
    const painting   = isTrue(configData.includePainting) || isTrue(configData.paintGroundFloor);
    const paintColor = mapPaintColor(configData.paintColorTheme || configData.paintColorThemeGround);
    const plastering2= isTrue(configData.includePlastering) || isTrue(configData.plasterSecondFloor);
    const painting2  = isTrue(configData.includePainting) || isTrue(configData.paintSecondFloor);
    const paintColor2= mapPaintColor(configData.paintColorTheme || configData.paintColorThemeSecond);
    const hasCeiling = isTrue(configData.hasCeiling) || isTrue(configData.groundFloorCeiling) || isTrue(configData.ceilingGroundFloor);
    const hasCeiling2 = isTrue(configData.mezzanineCeiling) || isTrue(configData.hasCeiling) || isTrue(configData.ceilingSecondFloor);
    const applyTiles = isTrue(configData.applyTilesGround);
    const applyTiles2= isTrue(configData.applyTilesSecond);
    const roofType   = configData.roofStyle || 'Corrugated GI Sheet / Yero';

    const bed1 = parseInt(configData.bedrooms1F || 0);
    const cr1  = parseInt(configData.crs1F || 0);
    const bed2 = parseInt(configData.bedrooms2F || 0);
    const cr2  = parseInt(configData.crs2F || 0);
    const wallType = configData.wallingTypeAboveChb || configData.wallingMaterialType || 'Metal Cladding Sheets';

    // --- MATERIALS ---
    let wallMat;
    if (painting) {
        wallMat = new THREE.MeshStandardMaterial({ color: paintColor, roughness: 0.55, metalness: 0.0 });
    } else if (plastering) {
        wallMat = new THREE.MeshStandardMaterial({ color: '#D0CCC4', roughness: 0.75 });
    } else {
        wallMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9, map: chbTex });
    }

    let roofMat;
    if (roofType === "Polycarbonate Sheet Roofing") {
        roofMat = new THREE.MeshStandardMaterial({ color: 0x4aa0d0, roughness: 0.2, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
    } else if (roofType === "Concrete Flat Deck Roof") {
        roofMat = new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 0.95, side: THREE.DoubleSide });
    } else if (roofType === "Metal Stone-Coated / Tile Roof") {
        roofMat = new THREE.MeshStandardMaterial({ color: 0xa05a40, roughness: 0.8, side: THREE.DoubleSide });
    } else if (roofType === "Long Span Pre-Painted Roofing" || roofType === "Color Roof / Pre-painted Corrugated") {
        roofMat = new THREE.MeshStandardMaterial({ color: 0x8b3a3a, roughness: 0.7, map: roofTex, side: THREE.DoubleSide }); // Painted Red
    } else if (roofType === "Spandrel Ceiling Roof") {
        roofMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.9, map: roofTex, side: THREE.DoubleSide }); // Beige
    } else {
        // Corrugated GI Sheet / Yero
        roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.85, roughness: 0.2, map: yeroTex, side: THREE.DoubleSide }); // Shiny bright silver with Yero texture
    }
    let wallMat2;
    if (painting2) {
        wallMat2 = new THREE.MeshStandardMaterial({ color: paintColor2, roughness: 0.55, metalness: 0.0 });
    } else if (plastering2) {
        wallMat2 = new THREE.MeshStandardMaterial({ color: '#D0CCC4', roughness: 0.75 });
    } else {
        wallMat2 = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9, map: chbTex });
    }

    const fascMat    = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }); // fascia boards
    const colMat     = new THREE.MeshStandardMaterial({ color: paintColor, roughness: 0.5 });
    const concMat    = new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 0.95 });
    const slabMat    = applyTiles ? new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.4, map: makeDynamicTileTex(configData.tileSize, L, W) }) : concMat;
    const slabMat2   = applyTiles2 ? new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.4, map: makeDynamicTileTex(configData.tileSize, L2, W2) }) : concMat;
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf8f6f2, roughness: 1.0 });
    const glassMat   = new THREE.MeshStandardMaterial({ color: 0x8ab4c8, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.45 });
    const frameMat   = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 });
    const doorMat    = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.7 });
    const doorGlsMat = new THREE.MeshStandardMaterial({ color: 0x90b8cc, roughness: 0.05, transparent: true, opacity: 0.5 });

    let lightMat = null;
    if (type === 'Half Amakan' || type === 'Half Metal') {
        const wt = wallType || '';
        if (wt.includes('Plywood')) {
            lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: plywoodTex, roughness: 0.8 });
        } else if (wt.includes('Hardiflex') || wt.includes('Fiber')) {
            lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: hardiflexTex, roughness: 0.9 });
        } else if (wt.includes('Metal')) {
            lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: metalTex, roughness: 0.2, metalness: 0.6 });
        } else {
            lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: amakanTex, roughness: 0.9 });
        }
    }

    let totalH = H1;
    let needsSlab = false;
    if (type === 'Two Storey') { totalH = H1 + H2; needsSlab = true; }
    else if (type === 'Loft Style') { totalH = H1 + 1.5; needsSlab = true; }
    else if (type === 'Half Amakan' || type === 'Half Metal') { totalH = H1 + 1.5; } // upper cladding = 1.5m above CHB base

    const wt = 0.2; // wall thickness

    // ---- 1. OUTER WALLS ----
    function wallRing(wL, wW, wH, yBot, mat, layer=0) {
        if (wH <= 0) return;
        const cy = yBot + wH/2;
        box(wL, wH, wt,          0,    cy, -wW/2+wt/2, mat, wallGroup, true, "wall", layer); // back
        box(wL, wH, wt,          0,    cy,  wW/2-wt/2, mat, wallGroup, true, "wall", layer); // front
        box(wt, wH, wW-wt*2,  -wL/2+wt/2, cy, 0,      mat, wallGroup, true, "wall", layer); // left
        box(wt, wH, wW-wt*2,   wL/2-wt/2, cy, 0,      mat, wallGroup, true, "wall", layer); // right
    }

    // ---- 1.5 INTERIOR ROOMS ----
    function buildRooms(numBeds, numCRs, ox, oz, flL, flW, wallH, baseY, mat, isBaseFloor, layer=0) {
        let beds = parseInt(numBeds) || 0;
        let crs = parseInt(numCRs) || 0;
        if (beds === 0 && crs === 0) return;

        const cy = baseY + wallH / 2;
        
        // --- BEDROOMS ---
        let availableH = wallH;
        if (baseY === 0) availableH = (window.currentRendererHouseType === 'Two Storey') ? H1 : totalH;
        const dH = Math.min(2.1, availableH * 0.85);

        let bedDepth = 0;
        if (beds > 0) {
            let bedDepthPercent = 0.45;
            if (flW <= 7) bedDepthPercent = 0.50;
            if (flW <= 5) bedDepthPercent = 0.55;
            bedDepth = Math.min(4.5, flW * bedDepthPercent);
            const bedFrontZ = -flW/2 + bedDepth;
            const bedWidth = Math.min(4.5, (flL - wt*2) / beds); // Cap bedroom width at 4.5m
            const totalBedWidth = bedWidth * beds;
            
            // Hallway Wall for Bedrooms (only spans the actual bedrooms)
            box(totalBedWidth, wallH, wt, ox - flL/2 + wt + totalBedWidth/2, cy, oz + bedFrontZ, mat, wallGroup, true, "wall", layer);

            for (let i = 0; i < beds; i++) {
                const roomLeftX = -flL/2 + wt + i * bedWidth;
                const roomCenterX = roomLeftX + bedWidth / 2;
                
                // Partition Wall (between bedrooms)
                if (i > 0) {
                    box(wt, wallH, bedDepth - wt, ox + roomLeftX, cy, oz - flW/2 + wt/2 + bedDepth/2, mat, wallGroup, true, "wall", layer);
                }
                
                // Side wall for the right-most bedroom (to close the block if it doesn't span the full house)
                if (i === beds - 1 && totalBedWidth < flL - wt*2 - 0.1) {
                    box(wt, wallH, bedDepth - wt, ox + roomLeftX + bedWidth, cy, oz - flW/2 + wt/2 + bedDepth/2, mat, wallGroup, true, "wall", layer);
                }
                
                // Door
                if (isBaseFloor) {
                    const maxDoorW = Math.max(0.6, bedWidth - 0.4); // Leave 0.2m padding on each side
                    let dW = Math.min(0.9, maxDoorW);
                    const doorX = ox + roomCenterX; // Place exactly in the center
                    const doorY = baseY + dH / 2;
                    const doorZ = oz + bedFrontZ;
                    
                    box(dW, dH, wt + 0.04, doorX, doorY, doorZ, doorMat, wallGroup, false, "door", layer);
                    box(dW + 0.1, 0.05, wt + 0.06, doorX, doorY + dH/2, doorZ, frameMat, wallGroup, false, "door", layer);
                    box(0.05, dH + 0.05, wt + 0.06, doorX - dW/2, doorY, doorZ, frameMat, wallGroup, false, "door", layer);
                    box(0.05, dH + 0.05, wt + 0.06, doorX + dW/2, doorY, doorZ, frameMat, wallGroup, false, "door", layer);
                    addBlueprintDoorSymbol(doorX, doorZ, dW, 'bed', layer);
                }
                
                if (isBaseFloor) {
                    const label = createTextSprite(`Bedroom ${i + 1}`, layer);
                    label.position.set(ox + roomCenterX, 20, oz + bedFrontZ - bedDepth / 2);
                    blueprintGroup.add(label);
                }
            }
        }

        // --- COMFORT ROOMS (CRs) ---
        if (crs > 0) {
            let crDepthPercent = 0.25;
            if (flW <= 7) crDepthPercent = 0.30;
            if (flW <= 5) crDepthPercent = 0.35;
            const crDepth = Math.min(2.5, flW * crDepthPercent);
            const crWidth = Math.min(2.5, (flL - wt*2) / crs);
            const crFrontZ = flW/2 - wt;
            const crBackZ = crFrontZ - crDepth;
            
            // Hallway wall for CRs
            box(crWidth * crs, wallH, wt, ox - flL/2 + wt + (crWidth * crs)/2, cy, oz + crBackZ, mat, wallGroup, true, "wall", layer);
            
            for (let i = 0; i < crs; i++) {
                const roomLeftX = -flL/2 + wt + i * crWidth;
                const roomCenterX = roomLeftX + crWidth / 2;
                
                // Partition Wall
                if (i > 0) {
                    box(wt, wallH, crDepth, ox + roomLeftX, cy, oz + crBackZ + crDepth/2, mat, wallGroup, true, "wall", layer);
                }
                
                // Side wall for the right-most CR
                if (i === crs - 1) {
                    box(wt, wallH, crDepth, ox + roomLeftX + crWidth, cy, oz + crBackZ + crDepth/2, mat, wallGroup, true, "wall", layer);
                }
                
                // Door
                if (isBaseFloor) {
                    const maxDoorW = Math.max(0.6, crWidth - 0.4);
                    let dW = Math.min(0.8, maxDoorW);
                    const doorX = ox + roomCenterX; // Place exactly in center
                    const doorY = baseY + dH / 2;
                    const doorZ = oz + crBackZ;
                    
                    box(dW, dH, wt + 0.04, doorX, doorY, doorZ, doorMat, wallGroup, false, "door", layer);
                    box(dW + 0.1, 0.05, wt + 0.06, doorX, doorY + dH/2, doorZ, frameMat, wallGroup, false, "door", layer);
                    box(0.05, dH + 0.05, wt + 0.06, doorX - dW/2, doorY, doorZ, frameMat, wallGroup, false, "door", layer);
                    box(0.05, dH + 0.05, wt + 0.06, doorX + dW/2, doorY, doorZ, frameMat, wallGroup, false, "door", layer);
                    addBlueprintDoorSymbol(doorX, doorZ, dW, 'cr', layer);
                }
                
                if (isBaseFloor) {
                    const label = createTextSprite(`CR ${i + 1}`, layer);
                    label.position.set(ox + roomCenterX, 20, oz + crBackZ + crDepth / 2);
                    blueprintGroup.add(label);
                }
                
                if (isBaseFloor || baseY > 0) {
                    const crFloorMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2 }); // Light gray instead of bright blue
                    box(crWidth - wt, 0.05, crDepth - wt, ox + roomCenterX, baseY + 0.025, oz + crBackZ + crDepth/2, crFloorMat, slabGroup, true, "wall", layer);
                }
            }
        }
    }

    const baseLayer = (type === 'Two Storey' || type === 'Loft Style') ? 3 : 0;
    
    function addDimensionLabels(wL, wW, cx, cz, layer) {
        const dL = parseFloat(wL).toFixed(1).replace(/\.0$/, '');
        const dW = parseFloat(wW).toFixed(1).replace(/\.0$/, '');
        
        const bottomLabel = createTextSprite(`${dW}m`, layer);
        bottomLabel.position.set(cx + wL/2 + 1.2, 20, cz);
        blueprintGroup.add(bottomLabel);

        const topLabel = createTextSprite(`${dW}m`, layer);
        topLabel.position.set(cx - wL/2 - 1.2, 20, cz);
        blueprintGroup.add(topLabel);

        const leftLabel = createTextSprite(`${dL}m`, layer);
        leftLabel.position.set(cx, 20, cz + wW/2 + 1.2);
        blueprintGroup.add(leftLabel);

        const rightLabel = createTextSprite(`${dL}m`, layer);
        rightLabel.position.set(cx, 20, cz - wW/2 - 1.2);
        blueprintGroup.add(rightLabel);
    }
    
    const layer1F = (type === 'Two Storey' || type === 'Loft Style') ? 1 : 0;
    addDimensionLabels(L, W, 0, 0, layer1F);
    
    if (type === 'Bungalow' || type === 'CHB' || type === 'Modern Minimalist') {
        wallRing(L, W, totalH, 0, wallMat, baseLayer);
        buildRooms(bed1, cr1, 0, 0, L, W, totalH, 0, wallMat, true, 1);
        
    } else if (type === 'Two Storey') {
        wallRing(L, W, H1, 0, wallMat, baseLayer);
        buildRooms(bed1, cr1, 0, 0, L, W, H1, 0, wallMat, true, 1);
        
        const ox=(L-L2)/2, oz=(W-W2)/2;
        const cy2 = H1 + H2/2;
        box(L2,H2,wt, -ox, cy2, -W2/2+wt/2, wallMat2, wallGroup, true, "wall", 2);
        box(L2,H2,wt, -ox, cy2,  W2/2-wt/2, wallMat2, wallGroup, true, "wall", 2);
        box(wt,H2,W2-wt*2, -ox-L2/2+wt/2, cy2, -oz, wallMat2, wallGroup, true, "wall", 2);
        box(wt,H2,W2-wt*2, -ox+L2/2-wt/2, cy2, -oz, wallMat2, wallGroup, true, "wall", 2);
        
        buildRooms(bed2, cr2, -ox, -oz, L2, W2, H2, H1, wallMat2, true, 2);
        addDimensionLabels(L2, W2, -ox, -oz, 2);

    } else if (lightMat) {
        const upper = totalH - H1;
        wallRing(L, W, H1, 0, wallMat, baseLayer);
        buildRooms(bed1, cr1, 0, 0, L, W, H1, 0, wallMat, true, 1);
        
        if (upper > 0) {
            wallRing(L, W, upper, H1, lightMat, baseLayer);
            buildRooms(bed1, cr1, 0, 0, L, W, upper, H1, lightMat, false, 1);
        }
    } else {
        wallRing(L, W, totalH, 0, wallMat, baseLayer);
        buildRooms(bed1, cr1, 0, 0, L, W, H1, 0, wallMat, true, 1);
        
        if (type === 'Loft Style') {
            const ox=(L-L2)/2, oz=(W-W2)/2;
            const cy2 = H1 + 0.5; // Railing height = 1m
            // 4 edges of the mezzanine acting as railing
            box(L2,1.0,wt, -ox, cy2, -W2/2+wt/2, wallMat2, wallGroup, true, "wall", 2);
            box(L2,1.0,wt, -ox, cy2,  W2/2-wt/2, wallMat2, wallGroup, true, "wall", 2);
            box(wt,1.0,W2-wt*2, -ox-L2/2+wt/2, cy2, -oz, wallMat2, wallGroup, true, "wall", 2);
            box(wt,1.0,W2-wt*2, -ox+L2/2-wt/2, cy2, -oz, wallMat2, wallGroup, true, "wall", 2);

            buildRooms(bed2, cr2, -ox, -oz, L2, W2, 1.5, H1, wallMat2, true, 2);
            addDimensionLabels(L2, W2, -ox, -oz, 2);
        }
    }

    // ---- 2. WINDOWS ----
    function addWindow(wx, wy, wz, ww, wh, axis, layer=0) {
        if (axis === 'Z') {
            box(wt+0.04, wh, ww, wx, wy, wz, glassMat, wallGroup, false, "wall", layer);
            box(wt+0.06, 0.06, ww+0.06, wx, wy+wh/2-0.03, wz, frameMat, wallGroup, false, "wall", layer);
            box(wt+0.06, 0.06, ww+0.06, wx, wy-wh/2+0.03, wz, frameMat, wallGroup, false, "wall", layer);
            box(wt+0.06, wh+0.06, 0.06, wx, wy, wz-ww/2+0.03, frameMat, wallGroup, false, "wall", layer);
            box(wt+0.06, wh+0.06, 0.06, wx, wy, wz+ww/2-0.03, frameMat, wallGroup, false, "wall", layer);
            box(wt+0.06, wh, 0.03, wx, wy, wz, frameMat, wallGroup, false, "wall", layer);
        } else {
            box(ww, wh, wt+0.04, wx, wy, wz, glassMat, wallGroup, false, "wall", layer);
            box(ww+0.06, 0.06, wt+0.06, wx, wy+wh/2, wz, frameMat, wallGroup, false, "wall", layer);
            box(ww+0.06, 0.06, wt+0.06, wx, wy-wh/2, wz, frameMat, wallGroup, false, "wall", layer);
            box(0.06, wh+0.06, wt+0.06, wx-ww/2, wy, wz, frameMat, wallGroup, false, "wall", layer);
            box(0.06, wh+0.06, wt+0.06, wx+ww/2, wy, wz, frameMat, wallGroup, false, "wall", layer);
            box(0.03, wh, wt+0.06, wx, wy, wz, frameMat, wallGroup, false, "wall", layer);
        }
        addBlueprintWindowSymbol(wx, wz, ww, axis, layer);
    }

    let groundWallH = H1;
    if (type === 'Half Amakan' || type === 'Half Metal') groundWallH = totalH;

    const frontX = L/2 - wt/2;

    // --- Ground Floor Door & Window Sizing ---
    const doorH  = Math.min(2.4, groundWallH * 0.85);
    const doorW2 = Math.min(1.1, W * 0.25); // Scale door width if house is very narrow
    const doorX  = frontX;
    const doorY  = doorH / 2;

    // Center door in the Living / Kitchen area to avoid intersecting bedroom partition
    let groundBedFrontZ = -W/2;
    if (bed1 > 0) {
        let bedDepthPercent = 0.45;
        if (W <= 7) bedDepthPercent = 0.50;
        if (W <= 5) bedDepthPercent = 0.55;
        const bedDepth = Math.min(4.5, W * bedDepthPercent);
        groundBedFrontZ = -W/2 + bedDepth;
    }
    const doorZ  = (groundBedFrontZ + W/2) / 2;

    const win1Y = groundWallH * 0.55;
    const win1H = groundWallH * 0.45;
    
    // Calculate available space between door and corner column
    const doorEdgeZ = doorZ - doorW2 / 2;
    const cornerZ = -W / 2 + 0.2; // roughly column inner edge
    const spaceW = Math.abs(doorEdgeZ - cornerZ);
    
    const winW = Math.max(0.2, Math.min(1.3, spaceW * 0.85)); // Max 1.3m, scales down
    const win1Z = (doorEdgeZ + cornerZ) / 2;

    // --- Single front face window for Ground Floor ---
    addWindow(frontX, win1Y, win1Z, winW, win1H, 'Z', layer1F);

    // --- Single front face window for 2nd Floor (if applicable) ---
    if (type === 'Two Storey') {
        const ox = (L - L2) / 2;
        const oz = (W - W2) / 2;
        const frontX2 = -ox + L2/2 - wt/2;
        const topWallH = (type === 'Two Storey') ? H2 : 1.5;
        const win2Y = H1 + topWallH * 0.55;
        const win2H = topWallH * 0.45;
        const win2Width = W2 * 0.45; // Reduced from 80% to 45% for a more balanced look
        addWindow(frontX2, win2Y, -oz, win2Width, win2H, 'Z', 2);
    }

    // ---- 3. FRONT DOOR (on +X face) ----
    // Variables (doorH, doorW2, doorX, doorY, doorZ) are calculated above
    // Door panel
    box(wt+0.04, doorH, doorW2, doorX, doorY, doorZ, doorMat, wallGroup, false, "door", layer1F);
    // Glass strip on door
    box(wt+0.06, doorH*0.5, doorW2*0.4, doorX, doorY+doorH*0.1, doorZ, doorGlsMat, wallGroup, false, "door", layer1F);
    // Door frame
    box(wt+0.06, 0.08, doorW2+0.1, doorX, doorH-0.04, doorZ, frameMat, wallGroup, false, "door", layer1F); // top
    box(wt+0.06, doorH, 0.06, doorX, doorY, doorZ - doorW2/2 - 0.03, frameMat, wallGroup, false, "door", layer1F); // left
    box(wt+0.06, doorH, 0.06, doorX, doorY, doorZ + doorW2/2 + 0.03, frameMat, wallGroup, false, "door", layer1F); // right
    
    addBlueprintDoorSymbol(doorX, doorZ, doorW2, 'front', layer1F);

    // ---- 5. FLOOR SLAB ----
    // Main Living Area Label (always 1st floor)
    const mainLabelLayer = (type === 'Two Storey' || type === 'Loft Style') ? 1 : 0;
    const mainLabel = createTextSprite('Living / Kitchen', mainLabelLayer);
    mainLabel.position.set(L * 0.25, 20, doorZ); // Shift down vertically (X) to avoid stairs
    blueprintGroup.add(mainLabel);

    box(L, 0.2, W, 0, 0.1, 0, slabMat, slabGroup, true, "wall", baseLayer);
    if (needsSlab) {
        const slX = -(L-L2)/2;
        const slZ = -(W-W2)/2;
        
        // Define stairwell dimensions
        const sw = 0.9;
        const sd = Math.min(3.0, W2 - 0.5);
        
        // Piece 1: Right part of slab (Full length L2, where bedrooms sit)
        const p1D = W2 - sd;
        if (p1D > 0.1) {
            box(L2, 0.18, p1D, slX, H1, slZ - W2/2 + p1D/2, slabMat2, slabGroup, true, "wall", 2);
        }
        
        // Piece 2: Left part of slab (Top length L2 - sw, to leave a hole for stairs at bottom-left)
        const p2W = L2 - sw;
        if (p2W > 0.1) {
            box(p2W, 0.18, sd, slX - L2/2 + p2W/2, H1, slZ + W2/2 - sd/2, slabMat2, slabGroup, true, "wall", 2);
        }

        // Generate stairs in the hole (Layer 1 so they only appear in 1st floor view)
        const stairCX = slX + L2/2 - sw/2;
        const stairCZ = slZ + W2/2 - sd/2;
        addStairs(stairCX, stairCZ, sw, sd, H1, slabMat2, 1);
    }

    // ---- 6. COLUMNS (structural) ----
    const colSkip = [];
    function addCol(cx, cz, ch) {
        // Skip if near door
        if (Math.abs(cx-L/2)<0.6 && Math.abs(cz)<0.8) return;
        // Skip duplicates
        for(const c of colSkip) if(Math.abs(c[0]-cx)<0.15 && Math.abs(c[1]-cz)<0.15) return;
        colSkip.push([cx,cz]);
        
        let actualH = ch;
        if (type === 'Two Storey' && ch === totalH) {
            // Clamp column height to 1st floor if it's outside the 2nd floor footprint
            const inL2 = cx >= -L/2 - 0.1 && cx <= -L/2 + L2 + 0.1;
            const inW2 = cz >= -W/2 - 0.1 && cz <= -W/2 + W2 + 0.1;
            if (!(inL2 && inW2)) {
                actualH = H1;
            }
        }

        // Column with slight taper for realism
        box(0.25, actualH, 0.25, cx, actualH/2, cz, colMat, columnGroup, true, "wall", baseLayer);
        // Capital (top plate)
        box(0.34, 0.08, 0.34, cx, actualH-0.04, cz, colMat, columnGroup, true, "wall", baseLayer);
    }

    addCol(-L/2, -W/2, totalH); addCol(L/2, -W/2, totalH);
    addCol(-L/2,  W/2, totalH); addCol(L/2,  W/2, totalH);
    const nL = Math.max(0, Math.floor(L/3)-1);
    const nW = Math.max(0, Math.floor(W/3)-1);
    for(let i=1;i<=nL;i++){
        const cx=-L/2+L*i/(nL+1);
        addCol(cx,-W/2,totalH); addCol(cx,W/2,totalH);
    }
    for(let i=1;i<=nW;i++){
        const cz=-W/2+W*i/(nW+1);
        addCol(-L/2,cz,totalH); addCol(L/2,cz,totalH);
    }

    // ---- 7. ROOF GENERATION ----
    const eave  = 0.8;  // eave overhang
    const ridge = 2.2;  // ridge height

    const rW = (type === 'Two Storey') ? (W2 + eave*2) / 2 : (W + eave*2) / 2;
    const rL = (type === 'Two Storey') ? (L2 + eave*2) / 2 : (L + eave*2) / 2;
    const ty = totalH;
    
    const roofXOffset = (type === 'Two Storey') ? -(L - L2)/2 : 0;
    const roofZOffset = (type === 'Two Storey') ? -(W - W2)/2 : 0;

    // Add lower roof for the exposed 1st floor if L2 < L or W2 < W (Only for Two Storey)
    if (type === 'Two Storey') {
        const expL = L - L2;
        const expW = W - W2;
        
        if (expL > 0) {
            const expX = -L/2 + L2 + expL/2;
            box(expL + eave, 0.2, W + eave*2, expX + eave/2, H1 + 0.1, 0, roofMat, roofGroup);
            box(expL + eave, 0.2, 0.05, expX + eave/2, H1 + 0.1, -(W/2 + eave), fascMat, roofGroup);
            box(expL + eave, 0.2, 0.05, expX + eave/2, H1 + 0.1, W/2 + eave, fascMat, roofGroup);
            box(0.05, 0.2, W + eave*2, L/2 + eave, H1 + 0.1, 0, fascMat, roofGroup); // front fascia
        }
        
        if (expW > 0) {
            const sideZ = -W/2 + W2 + expW/2;
            const sideX = -L/2 + L2/2;
            box(L2 + eave/2, 0.2, expW + eave, sideX - eave/4, H1 + 0.1, sideZ + eave/2, roofMat, roofGroup);
            box(L2 + eave/2, 0.2, 0.05, sideX - eave/4, H1 + 0.1, sideZ + expW/2 + eave, fascMat, roofGroup); // right fascia
            box(0.05, 0.2, expW + eave, sideX - L2/2 - eave, H1 + 0.1, sideZ + eave/2, fascMat, roofGroup); // back fascia
        }
    }

    if (roofType === "Concrete Flat Deck Roof") {
        // Flat slab
        box(rL*2, 0.2, rW*2, roofXOffset, ty + 0.1, roofZOffset, roofMat, roofGroup);
        // Parapet walls (0.6m high)
        const pH = 0.6;
        box(rL*2, pH, 0.2, roofXOffset, ty + 0.2 + pH/2, roofZOffset - rW + 0.1, roofMat, roofGroup); // back
        box(rL*2, pH, 0.2, roofXOffset, ty + 0.2 + pH/2, roofZOffset + rW - 0.1, roofMat, roofGroup); // front
    } else {
        // Gable roof slope
        function makeRoofSlope(rL, rW, ridge, ty, xOff, zOff) {
            const geo1 = new THREE.BufferGeometry();
            const v1 = new Float32Array([
                -rL,0,0,   rL,0,0,   rL,0,rW,
                -rL,0,0,   rL,0,rW, -rL,0,rW,
                -rL,ridge,0, rL,ridge,0, rL,0,rW,
                -rL,ridge,0, rL,0,rW, -rL,0,rW,
                -rL,0,0, -rL,0,rW, -rL,ridge,0,
                rL,0,0,  rL,ridge,0, rL,0,rW,
            ]);
            const uvs = new Float32Array([
                0,0, 1,0, 1,1,
                0,0, 1,1, 0,1,
                0,1, 1,1, 1,0,
                0,1, 1,0, 0,0,
                0,0, 1,0, 0,1,
                0,0, 0,1, 1,0
            ]);
            geo1.setAttribute('position', new THREE.BufferAttribute(v1, 3));
            geo1.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            geo1.computeVertexNormals();
            const m1 = new THREE.Mesh(geo1, roofMat);
            m1.position.set(xOff, ty, zOff);
            m1.castShadow = true; m1.receiveShadow = true;
            roofGroup.add(m1);

            const geo2 = new THREE.BufferGeometry();
            const v2 = new Float32Array([
                -rL,0,0,   rL,0,0,   rL,0,-rW,
                -rL,0,0,   rL,0,-rW, -rL,0,-rW,
                -rL,ridge,0, rL,ridge,0, rL,0,-rW,
                -rL,ridge,0, rL,0,-rW, -rL,0,-rW,
                -rL,0,0, -rL,0,-rW, -rL,ridge,0,
                rL,0,0,  rL,ridge,0, rL,0,-rW,
            ]);
            geo2.setAttribute('position', new THREE.BufferAttribute(v2, 3));
            geo2.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            geo2.computeVertexNormals();
            const m2 = new THREE.Mesh(geo2, roofMat);
            m2.position.set(xOff, ty, zOff);
            m2.castShadow = true; m2.receiveShadow = true;
            roofGroup.add(m2);
        }

        makeRoofSlope(rL, rW, ridge, ty, roofXOffset, roofZOffset);

        // Add fascias
        box(rL*2, 0.2, 0.05, roofXOffset, ty+0.1, roofZOffset - rW, fascMat, roofGroup);
        box(rL*2, 0.2, 0.05, roofXOffset, ty+0.1, roofZOffset + rW, fascMat, roofGroup);
    }

    // ---- 8. CEILING ----
    if (hasCeiling) {
        box(L, 0.06, W, 0, H1-0.03, 0, ceilingMat, roofGroup);
    }
    if ((type==='Two Storey'||type==='Loft Style') && hasCeiling2) {
        const ox=-(L-L2)/2, oz=-(W-W2)/2;
        box(L2, 0.06, W2, ox, totalH-0.03, oz, ceilingMat, roofGroup);
    }
}



// ============================================================
//  X-RAY TOGGLES
// ============================================================


// ============================================================
//  KEYBOARD PAN (WASD / ARROWS)
// ============================================================
const moveSpeed = 0.4;
window.addEventListener('keydown', e => {
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    const fwd = new THREE.Vector3(); cameraExt.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
    const rgt = new THREE.Vector3(); rgt.crossVectors(fwd, cameraExt.up).normalize();
    switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup':    cameraExt.position.addScaledVector(fwd,  moveSpeed); controlsExt.target.addScaledVector(fwd,  moveSpeed); break;
        case 's': case 'arrowdown':  cameraExt.position.addScaledVector(fwd, -moveSpeed); controlsExt.target.addScaledVector(fwd, -moveSpeed); break;
        case 'a': case 'arrowleft':  cameraExt.position.addScaledVector(rgt, -moveSpeed); controlsExt.target.addScaledVector(rgt, -moveSpeed); break;
        case 'd': case 'arrowright': cameraExt.position.addScaledVector(rgt,  moveSpeed); controlsExt.target.addScaledVector(rgt,  moveSpeed); break;
    }
});

// ============================================================
//  RENDER LOOP
// ============================================================
function animate() {
    requestAnimationFrame(animate);

    const houseType = window.currentRendererHouseType;
    const isSplit = (houseType === 'Two Storey' || houseType === 'Loft Style');
    
    // Update FP camera aspect ratio dynamically
    const w = fpContainer.clientWidth;
    const h = fpContainer.clientHeight;
    const a = (isSplit ? w/2 : w) / h;
    const baseFpD = fpD * (isSplit ? 1.3 : 1.0);
    cameraFP.left = -baseFpD * a;
    cameraFP.right = baseFpD * a;
    cameraFP.top = baseFpD;
    cameraFP.bottom = -baseFpD;
    cameraFP.updateProjectionMatrix();

    controlsExt.update(); controlsFP.update();

    // 1. Exterior Render (Normal 3D)
    roofGroup.visible = true;
    blueprintGroup.visible = false;
    rendererExt.render(scene, cameraExt);

    // 2. Blueprint Render (2D Floor Plan)
    const bg = scene.background;
    scene.background = new THREE.Color(0xffffff);
    const wasRoof = roofGroup.visible;
    roofGroup.visible = false;
    blueprintGroup.visible = true;

    const oldMats = new Map();
    const oldVis = new Map();

    wallGroup.children.forEach(c => {
        oldMats.set(c, c.material);
        oldVis.set(c, c.visible);
        if (c.userData.type === "stair") { c.visible = false; }
        else if (c.material.opacity === 0.45) { c.material = fpWindowMat; } 
        else if (c.material.color.getHex() === 0x4a3520 || c.material.opacity === 0.5) { c.material = fpSlabMat; } 
        else if (c.material.color.getHex() === 0x222222) { c.visible = false; } 
        else { c.material = fpWallMat; }
    });

    slabGroup.children.forEach(c => {
        oldMats.set(c, c.material);
        if (c.material.color.getHex() !== 0x4488ff) { c.material = fpSlabMat; }
    });

    columnGroup.children.forEach(c => {
        oldMats.set(c, c.material);
        c.material = fpWallMat;
    });

    // Render floor plan split or full
    if (isSplit) {
        document.getElementById('fp-label-main').style.display = 'none';
        document.getElementById('fp-label-1').style.display = 'block';
        document.getElementById('fp-label-2').style.display = 'block';
        document.getElementById('fp-label-2').innerText = (houseType === 'Loft Style') ? 'MEZZANINE' : '2ND FLOOR';
        
        rendererFP.setScissorTest(true);
        
        // Render 1F (Left)
        rendererFP.setViewport(0, 0, w/2, h);
        rendererFP.setScissor(0, 0, w/2, h);
        cameraFP.layers.disableAll();
        cameraFP.layers.enable(1);
        cameraFP.layers.enable(3);
        rendererFP.render(scene, cameraFP);
        
        // Render 2F (Right)
        rendererFP.setViewport(w/2, 0, w/2, h);
        rendererFP.setScissor(w/2, 0, w/2, h);
        cameraFP.layers.disableAll();
        cameraFP.layers.enable(2);
        rendererFP.render(scene, cameraFP);
        
        rendererFP.setScissorTest(false);
        rendererFP.setViewport(0, 0, w, h);
        cameraFP.layers.enableAll();
    } else {
        document.getElementById('fp-label-main').style.display = 'block';
        document.getElementById('fp-label-1').style.display = 'none';
        document.getElementById('fp-label-2').style.display = 'none';
        
        rendererFP.setScissorTest(false);
        cameraFP.layers.enableAll();
        rendererFP.render(scene, cameraFP);
    }

    // Restore state
    scene.background = bg;
    roofGroup.visible = wasRoof;
    blueprintGroup.visible = false;

    wallGroup.children.forEach(c => { c.material = oldMats.get(c); c.visible = oldVis.get(c); });
    slabGroup.children.forEach(c => { c.material = oldMats.get(c); });
    columnGroup.children.forEach(c => { c.material = oldMats.get(c); });
}

// ============================================================
//  RESIZE
// ============================================================
window.addEventListener('resize', () => {
    cameraExt.aspect = extContainer.clientWidth / extContainer.clientHeight;
    cameraExt.updateProjectionMatrix();
    rendererExt.setSize(extContainer.clientWidth, extContainer.clientHeight);

    const a = fpContainer.clientWidth / fpContainer.clientHeight;
    cameraFP.left=-fpD*a; cameraFP.right=fpD*a; cameraFP.top=fpD; cameraFP.bottom=-fpD;
    cameraFP.updateProjectionMatrix();
    rendererFP.setSize(fpContainer.clientWidth, fpContainer.clientHeight);
});

// ============================================================
//  BOOT
// ============================================================



    // Default visibility
    roofGroup.visible = true;
    wallGroup.visible = true;
    slabGroup.visible = true;
    columnGroup.visible = true;

    buildHouseLogic(configData);
    animate();
}

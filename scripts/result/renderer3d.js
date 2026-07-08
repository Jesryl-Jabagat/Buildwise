
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
    
    // Use a data attribute to reliably prevent double-initialization
    const extContainer = document.getElementById('exterior-container');
    if (!extContainer) return;
    if (extContainer.dataset.rendererInit === 'true') return;
    extContainer.dataset.rendererInit = 'true';

    
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
// Temporary position — will be auto-fit after buildHouseLogic runs
cameraExt.position.set(20, 8, 14);
cameraExt.layers.enableAll();

const rendererExt = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
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

// ── Floor Plan: Two independent renderers ────────────────────────────────
// fp-container-1 = Floor 1 (always shown)
// fp-container-2 = Floor 2 / Mezzanine (shown only for two-story / loft)
const fpContainer1 = document.getElementById('fp-container-1');
const fpContainer2 = document.getElementById('fp-container-2');

const fpD = 8;

// Camera 1 (Floor 1)
const fpAspect1 = fpContainer1 ? (fpContainer1.clientWidth / fpContainer1.clientHeight) : 1;
const cameraFP1 = new THREE.OrthographicCamera(-fpD*fpAspect1, fpD*fpAspect1, fpD, -fpD, 1, 150);
cameraFP1.position.set(0, 50, 0);
cameraFP1.lookAt(0, 0, 0);
cameraFP1.up.set(-1, 0, 0);

const rendererFP1 = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
if (fpContainer1) {
    rendererFP1.setSize(fpContainer1.clientWidth, fpContainer1.clientHeight);
    rendererFP1.setPixelRatio(window.devicePixelRatio);
    rendererFP1.shadowMap.enabled = false;
    rendererFP1.toneMapping = THREE.ACESFilmicToneMapping;
    rendererFP1.toneMappingExposure = 1.0;
    fpContainer1.appendChild(rendererFP1.domElement);
}

const controlsFP1 = new THREE.OrbitControls(cameraFP1, rendererFP1.domElement);
controlsFP1.enableRotate = false;
controlsFP1.enableDamping = true;
controlsFP1.dampingFactor = 0.05;

// Camera 2 (Floor 2 / Mezzanine) — independent controls
const fpAspect2 = fpContainer2 ? (fpContainer2.clientWidth / fpContainer2.clientHeight) : 1;
const cameraFP2 = new THREE.OrthographicCamera(-fpD*fpAspect2, fpD*fpAspect2, fpD, -fpD, 1, 150);
cameraFP2.position.set(0, 50, 0);
cameraFP2.lookAt(0, 0, 0);
cameraFP2.up.set(-1, 0, 0);

const rendererFP2 = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
if (fpContainer2) {
    rendererFP2.setSize(fpContainer2.clientWidth || 300, fpContainer2.clientHeight || 300);
    rendererFP2.setPixelRatio(window.devicePixelRatio);
    rendererFP2.shadowMap.enabled = false;
    rendererFP2.toneMapping = THREE.ACESFilmicToneMapping;
    rendererFP2.toneMappingExposure = 1.0;
    fpContainer2.appendChild(rendererFP2.domElement);
}

const controlsFP2 = new THREE.OrbitControls(cameraFP2, rendererFP2.domElement);
controlsFP2.enableRotate = false;
controlsFP2.enableDamping = true;
controlsFP2.dampingFactor = 0.05;


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

// Furniture Materials
const bedMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
const woodMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
const sofaMat = new THREE.MeshLambertMaterial({ color: 0x4a5a6a });
const kitMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
const plantMat = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
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
textureLoader.setCrossOrigin('anonymous');
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
    grp.add(mesh);
    return mesh;
}

function doorknob(radius, length, x, y, z, mat, grp, layer, axis='Z') {
    const geo = new THREE.CylinderGeometry(radius, radius, length, 16);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x,y,z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.type = "doorknob";
    mesh.layers.set(layer);
    if (axis === 'X') mesh.rotation.z = Math.PI / 2;
    if (axis === 'Z') mesh.rotation.x = Math.PI / 2;
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
        hx = x; hz = z - width/2;
        lx = hx - width; lz = hz; // leaf opens to -X (LEFT)
        startAngle = 0.5 * Math.PI; endAngle = Math.PI;
    }

    const leafGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(hx, y, hz), new THREE.Vector3(lx, y, lz)]);
    const leafLine = new THREE.Line(leafGeo, fpLineMat);
    leafLine.layers.set(layer);
    
    const curve = new THREE.EllipseCurve(hx, hz, width, width, startAngle, endAngle, false, 0);
    const points = curve.getPoints(16).map(p => new THREE.Vector3(p.x, y, p.y));
    const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
    const arcLine = new THREE.Line(arcGeo, fpLineMat);
    arcLine.layers.set(layer);
    
    group.add(leafLine, arcLine);
    blueprintGroup.add(group);
}

function buildFurniture(type, cx, cz, rotY, layer, param=null, cy=0) {
    const setLayer = (o, l) => {
        o.layers.set(l);
        if (o.children) o.children.forEach(c => setLayer(c, l));
    };

    const grp = new THREE.Group();
    grp.position.set(cx, cy, cz);
    grp.rotation.y = rotY;

    if (type === 'bed') {
        // 3D Bed (Double/Queen size approx 1.4 x 1.9)
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 2.0), woodMat);
        frame.position.y = 0.15;
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.9), bedMat);
        mattress.position.set(0, 0.4, 0);
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.4), kitMat);
        pillow.position.set(0, 0.55, -0.7);
        grp.add(frame); grp.add(mattress); grp.add(pillow);

        const bpGrp = new THREE.Group();
        const bpGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 0.01, 2.0));
        const bpLine = new THREE.LineSegments(bpGeo, fpLineMat);
        const pGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 0.01, 0.4));
        const pLine = new THREE.LineSegments(pGeo, fpLineMat);
        pLine.position.set(0, 0, -0.7);
        bpGrp.add(bpLine); bpGrp.add(pLine);
        bpGrp.position.set(cx, 20, cz); bpGrp.rotation.y = rotY;
        setLayer(bpGrp, layer); blueprintGroup.add(bpGrp);
    } else if (type === 'sofa') {
        // 3D Sofa
        const sW = param || 2.0;
        const base = new THREE.Mesh(new THREE.BoxGeometry(sW, 0.4, 0.8), sofaMat);
        base.position.y = 0.2;
        const back = new THREE.Mesh(new THREE.BoxGeometry(sW, 0.5, 0.2), sofaMat);
        back.position.set(0, 0.65, -0.3);
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.8), sofaMat);
        armL.position.set(-sW/2 + 0.1, 0.55, 0);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.8), sofaMat);
        armR.position.set(sW/2 - 0.1, 0.55, 0);
        grp.add(base); grp.add(back); grp.add(armL); grp.add(armR);

        const bpGrp = new THREE.Group();
        const bpGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(sW, 0.01, 0.8));
        const bpLine = new THREE.LineSegments(bpGeo, fpLineMat);
        bpGrp.add(bpLine);
        bpGrp.position.set(cx, 20, cz); bpGrp.rotation.y = rotY;
        setLayer(bpGrp, layer); blueprintGroup.add(bpGrp);
    } else if (type === 'tv') {
        const cW = param || 1.5;
        const console = new THREE.Mesh(new THREE.BoxGeometry(cW, 0.5, 0.4), woodMat);
        console.position.y = 0.25;
        const tW = Math.min(1.2, cW - 0.1);
        const tv = new THREE.Mesh(new THREE.BoxGeometry(tW, 0.7, 0.05), new THREE.MeshLambertMaterial({color:0x111111}));
        tv.position.set(0, 0.95, 0);
        grp.add(console); grp.add(tv);

        const bpGrp = new THREE.Group();
        const bpGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(cW, 0.01, 0.4));
        const bpLine = new THREE.LineSegments(bpGeo, fpLineMat);
        bpGrp.add(bpLine);
        bpGrp.position.set(cx, 20, cz); bpGrp.rotation.y = rotY;
        setLayer(bpGrp, layer); blueprintGroup.add(bpGrp);
    } else if (type === 'dining') {
        const dW = param || 1.2;
        const dD = Math.max(0.6, Math.min(0.8, dW * 0.7)); // Scale depth down if narrow
        const table = new THREE.Mesh(new THREE.BoxGeometry(dW, 0.05, dD), woodMat);
        table.position.y = 0.75;
        const leg = new THREE.Mesh(new THREE.BoxGeometry(dW * 0.5, 0.75, dD * 0.5), woodMat);
        leg.position.y = 0.375;
        grp.add(table); grp.add(leg);

        const bpGrp = new THREE.Group();
        const bpGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(dW, 0.01, dD));
        const bpLine = new THREE.LineSegments(bpGeo, fpLineMat);
        bpGrp.add(bpLine);
        bpGrp.position.set(cx, 20, cz); bpGrp.rotation.y = rotY;
        setLayer(bpGrp, layer); blueprintGroup.add(bpGrp);
    } else if (type === 'kitchen') {
        // Kitchen counter
        const kW = param || 2.0;
        const counter = new THREE.Mesh(new THREE.BoxGeometry(kW, 0.9, 0.6), kitMat);
        counter.position.y = 0.45;
        const sink = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.4), new THREE.MeshLambertMaterial({color:0x999999}));
        sink.position.set(kW/4, 0.91, 0);
        grp.add(counter); grp.add(sink);

        const bpGrp = new THREE.Group();
        const bpGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(kW, 0.01, 0.6));
        const bpLine = new THREE.LineSegments(bpGeo, fpLineMat);
        const sGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.5, 0.01, 0.4));
        const sLine = new THREE.LineSegments(sGeo, fpLineMat);
        sLine.position.set(kW/4, 0, 0);
        bpGrp.add(bpLine); bpGrp.add(sLine);
        bpGrp.position.set(cx, 20, cz); bpGrp.rotation.y = rotY;
        setLayer(bpGrp, layer); blueprintGroup.add(bpGrp);
    } else if (type === 'fridge') {
        const fridge = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.7), kitMat);
        fridge.position.y = 0.9;
        grp.add(fridge);

        const bpGrp = new THREE.Group();
        const bpGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.7, 0.01, 0.7));
        const bpLine = new THREE.LineSegments(bpGeo, fpLineMat);
        bpGrp.add(bpLine);
        bpGrp.position.set(cx, 20, cz); bpGrp.rotation.y = rotY;
        setLayer(bpGrp, layer); blueprintGroup.add(bpGrp);
    } else if (type === 'toilet') {
        const tH = 0.45;
        // Base of the toilet
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.35, 16), new THREE.MeshStandardMaterial({color: 0xffffff}));
        base.position.set(0, 0.175, 0.05);
        
        // Seat / Rim (Torus to create the open bowl look)
        const seat = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 16, 32), new THREE.MeshStandardMaterial({color: 0xffffff}));
        seat.rotation.x = Math.PI / 2;
        seat.position.set(0, 0.37, 0.05);
        
        // Water inside
        const water = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.01, 16), new THREE.MeshStandardMaterial({color: 0xaaccff}));
        water.position.set(0, 0.25, 0.05);
        
        // Water Tank
        const tank = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.2), new THREE.MeshStandardMaterial({color: 0xffffff}));
        tank.position.set(0, tH + 0.225, -0.15);
        
        grp.add(base); grp.add(seat); grp.add(water); grp.add(tank);
        
        const bpGrp = new THREE.Group();
        const bpGeo = new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.22, 0.22, 0.01, 16));
        const bpLine = new THREE.LineSegments(bpGeo, fpLineMat);
        bpLine.position.set(0, 0, 0.05);
        const tkGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.45, 0.01, 0.2));
        const tkLine = new THREE.LineSegments(tkGeo, fpLineMat);
        tkLine.position.set(0, 0, -0.15);
        bpGrp.add(bpLine); bpGrp.add(tkLine);
        bpGrp.position.set(cx, 20, cz); bpGrp.rotation.y = rotY;
        setLayer(bpGrp, layer); blueprintGroup.add(bpGrp);
    } else if (type === 'crsink') {
        const sH = 0.8;
        const sink = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.15, 16), new THREE.MeshStandardMaterial({color: 0xffffff}));
        sink.position.y = sH - 0.075;
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, sH - 0.15, 16), new THREE.MeshStandardMaterial({color: 0xffffff}));
        ped.position.y = (sH - 0.15)/2;
        grp.add(sink); grp.add(ped);
        
        const bpGrp = new THREE.Group();
        const bpGeo = new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.2, 0.2, 0.01, 16));
        const bpLine = new THREE.LineSegments(bpGeo, fpLineMat);
        bpGrp.add(bpLine);
        bpGrp.position.set(cx, 20, cz); bpGrp.rotation.y = rotY;
        setLayer(bpGrp, layer); blueprintGroup.add(bpGrp);
    }

    setLayer(grp, layer);
    
    grp.userData.type = "furniture";
    slabGroup.add(grp);
}

function addBlueprintWindowSymbol(x, z, width, axis, layer=0) {
    const y = 20.1;
    const group = new THREE.Group();
    
    // Background to "cut" the wall visually
    const bgGeo = (axis === 'Z') ? new THREE.BoxGeometry(0.15 + 0.05, 0.01, width) : new THREE.BoxGeometry(width, 0.01, 0.15 + 0.05);
    const bg = new THREE.Mesh(bgGeo, fpSlabMat); 
    bg.layers.set(layer);
    group.add(bg);
    
    // Inner window panes
    const paneGeo = (axis === 'Z') ? new THREE.BoxGeometry(0.04, 0.02, width) : new THREE.BoxGeometry(width, 0.02, 0.04);
    const pane = new THREE.Mesh(paneGeo, fpWindowMat); 
    pane.layers.set(layer);
    group.add(pane);
    
    // Outer frame outlines
    const edges = new THREE.EdgesGeometry(bgGeo);
    const line = new THREE.LineSegments(edges, fpLineMat);
    line.layers.set(layer);
    group.add(line);
    
    group.position.set(x, y, z);
    blueprintGroup.add(group);
}

function createTextSprite(message, layer=0) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256; // Taller canvas to support multiple lines
    const ctx = canvas.getContext('2d');
    
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    
    const lines = message.split('\n');
    const startY = canvas.height / 2 - ((lines.length - 1) * 32);
    lines.forEach((line, i) => {
        if (i > 0) ctx.font = '40px Arial'; // Smaller font for sub-text like area
        ctx.fillText(line, canvas.width / 2, startY + (i * 64));
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3.5, 1.75, 1); // Maintain 2:1 aspect ratio
    sprite.layers.set(layer);
    return sprite;
}

function addStairs(cx, cz, sw, sd, h, mat, layer=0) {
    const numSteps = Math.ceil(h / 0.18);
    const halfSteps = Math.floor(numSteps / 2);
    const stepH = h / numSteps;
    
    // Scale the landing dynamically based on the width of the stairwell
    const landingSize = sw / 2; 
    
    // Flight 1 (runs along Z, against the right wall +X)
    // Starts at the back of the stairwell (-Z), goes UP towards the front (+Z)
    const flight1D = sd - landingSize; 
    const step1D = flight1D / halfSteps;
    const f1X = cx + sw/2 - landingSize/2; 
    
    for (let i = 0; i < halfSteps; i++) {
        const sz = cz - sd/2 + (i + 0.5) * step1D; 
        const sy = (i + 0.5) * stepH;
        box(landingSize, stepH, step1D, f1X, sy, sz, mat, slabGroup, true, "stair", layer);
    }
    
    // Landing (Front-Right corner of the stairwell)
    const landingY = halfSteps * stepH;
    const landingZ = cz + sd/2 - landingSize/2; 
    const landingX = cx + sw/2 - landingSize/2; 
    box(landingSize, 0.1, landingSize, landingX, landingY, landingZ, mat, slabGroup, true, "stair", layer);
    
    // Flight 2 (runs along X, against the front wall +Z)
    // Starts at the landing (+X) and goes Left (-X)
    const flight2W = sw - landingSize; 
    const step2W = flight2W / (numSteps - halfSteps);
    const f2Z = cz + sd/2 - landingSize/2; 
    
    for (let i = halfSteps; i < numSteps; i++) {
        const j = i - halfSteps;
        const sx = cx + sw/2 - landingSize - (j + 0.5) * step2W;
        const sy = (i + 0.5) * stepH;
        box(step2W, stepH, landingSize, sx, sy, f2Z, mat, slabGroup, true, "stair", layer);
    }
    
    // 2D Blueprint Symbol
    const group = new THREE.Group();
    const geo1 = new THREE.BoxGeometry(landingSize, 0.01, sd);
    const line1 = new THREE.LineSegments(new THREE.EdgesGeometry(geo1), fpLineMat);
    line1.position.set(sw/2 - landingSize/2, 0, 0);
    line1.layers.set(layer); group.add(line1);
    
    const geo2 = new THREE.BoxGeometry(sw - landingSize, 0.01, landingSize);
    const line2 = new THREE.LineSegments(new THREE.EdgesGeometry(geo2), fpLineMat);
    line2.position.set(-(sw/2) + (sw-landingSize)/2, 0, sd/2 - landingSize/2);
    line2.layers.set(layer); group.add(line2);
    
    const upText = createTextSprite("STAIRS", layer);
    upText.scale.set(1.5, 0.4, 1);
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
    const knobMat    = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.3 });

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

    // Ensure mezzanine (L2) is large enough to fit the CR and the stairs without overlapping
    if ((type === 'Two Storey' || type === 'Loft Style') && cr1 > 0) {
        let estCrWidth = 0;
        if (bed1 > 0) {
            const bedWidth = (bed1 === 1) ? Math.min(4.5, (L - wt) * 0.60) : Math.min(4.5, (L - wt) / bed1);
            let safeCrWidth = Math.min(1.8, (L - wt) / cr1);
            estCrWidth = Math.max(0.8, Math.min(safeCrWidth, bedWidth * 0.50));
        } else {
            estCrWidth = Math.min(1.8, (L - wt) / cr1) * cr1;
        }
        const minL2 = estCrWidth + 1.6 + wt; // 1.6 is stairs width, +wt to clear walls safely
        if (L2 < minL2) L2 = minL2;
    }

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
        let availableH = wallH;
        if (baseY === 0) availableH = (window.currentRendererHouseType === 'Two Storey') ? H1 : totalH;
        const dH = Math.min(2.1, availableH * 0.85);

        // Calculate house inner bounds
        const houseBackZ = oz - flW/2 + wt/2;
        const houseFrontZ = oz + flW/2 - wt/2;
        const houseLeftX = ox - flL/2 + wt/2;
        const houseRightX = ox + flL/2 - wt/2;

        let bedDepth = 0;
        let hallwayWidth = 1.0; // Corridor for privacy zoning
        let totalBedWidth = 0;
        let hallwayFrontZ = 0;
        let safeCrDepth = 0;
        let safeCrWidth = 0;
        
        // --- BEDROOMS ---
        if (beds > 0) {
            let bedDepthPercent = 0.45;
            if (flW <= 7) bedDepthPercent = 0.50;
            if (flW <= 5) bedDepthPercent = 0.55;
            bedDepth = Math.min(4.5, flW * bedDepthPercent);
            
            const remainingW = flW - bedDepth;
            if (remainingW < 3.0) hallwayWidth = 0; // Skip hallway if too narrow
            
            const bedFrontZ = houseBackZ + bedDepth;
            hallwayFrontZ = bedFrontZ + hallwayWidth;
            
            let bedWidth;
            if (beds === 1) {
                // Keep the original corner box layout, but limit width so it doesn't push against the front door
                bedWidth = Math.min(4.5, (flL - wt) * 0.60);
            } else {
                bedWidth = Math.min(4.5, (flL - wt) / beds);
            }
            totalBedWidth = bedWidth * beds;
            
            // Pre-calculate CR dimensions so we can shift bedroom doors if needed
            if (crs > 0) {
                safeCrDepth = Math.min(1.8, flW * ((flW <= 7) ? 0.25 : 0.20));
                safeCrWidth = Math.min(1.8, (flL - wt) / crs);
                safeCrDepth = Math.max(0.8, Math.min(safeCrDepth, bedDepth * 0.40));
                safeCrWidth = Math.max(0.8, Math.min(safeCrWidth, bedWidth * 0.50));
            }
            
            // Front wall of bedrooms (back wall of hallway)
            // Added +wt to length and adjusted X center to overlap exterior wall and side wall seamlessly
            box(totalBedWidth + wt, wallH, wt, houseLeftX + totalBedWidth/2, cy, bedFrontZ, mat, wallGroup, true, "wall", layer);
            
            for (let i = 0; i < beds; i++) {
                const roomLeftX = houseLeftX + i * bedWidth;
                const roomCenterX = roomLeftX + bedWidth / 2;
                
                // Partition Wall
                // Added +wt to depth to overlap back exterior wall and front wall seamlessly
                if (i > 0) box(wt, wallH, bedDepth + wt, roomLeftX, cy, houseBackZ + bedDepth/2, mat, wallGroup, true, "wall", layer);
                
                // Side wall for the right-most bedroom (if it doesn't span full width)
                if (i === beds - 1 && totalBedWidth < flL - wt - 0.1) {
                    box(wt, wallH, bedDepth + wt, roomLeftX + bedWidth, cy, houseBackZ + bedDepth/2, mat, wallGroup, true, "wall", layer);
                }
                
                // Bedroom Door
                if (isBaseFloor) {
                    const dW = Math.min(0.9, bedWidth - 0.4);
                    let doorX = roomCenterX;
                    
                    // En-suites are assigned starting from Bed 1 (i=0) for CR 2, Bed 2 for CR 3, etc.
                    // So if crs >= i + 2, this room has an en-suite!
                    if (crs >= i + 2) {
                        if (bedWidth > safeCrWidth + dW) {
                            doorX = roomLeftX + safeCrWidth + (bedWidth - safeCrWidth) / 2;
                        } else {
                            doorX = roomLeftX + bedWidth - dW/2 - 0.1;
                        }
                    }
                    
                    const doorY = baseY + dH / 2;
                    const doorZ = bedFrontZ;
                    
                    box(dW, dH, wt + 0.04, doorX, doorY, doorZ, doorMat, wallGroup, false, "door", layer);
                    doorknob(0.035, wt + 0.14, doorX + dW/2 - 0.1, doorY - 0.1, doorZ, knobMat, wallGroup, layer, 'Z'); // Knob
                    box(dW + 0.1, 0.05, wt + 0.06, doorX, doorY + dH/2, doorZ, frameMat, wallGroup, false, "door", layer);
                    box(0.05, dH + 0.05, wt + 0.06, doorX - dW/2, doorY, doorZ, frameMat, wallGroup, false, "door", layer);
                    box(0.05, dH + 0.05, wt + 0.06, doorX + dW/2, doorY, doorZ, frameMat, wallGroup, false, "door", layer);
                    addBlueprintDoorSymbol(doorX, doorZ, dW, 'bed', layer);
                    
                    // Bedroom Window (Back wall)
                    const maxWinW = 1.2;
                    const winH = Math.min(1.2, availableH - 1.2);
                    const winY = baseY + winH/2 + 0.9;
                    
                    if (bedWidth > 3.5) {
                        // 2 windows for long walls
                        const winW = Math.max(0.6, Math.min(maxWinW, (bedWidth/2) - 0.8));
                        if (winW >= 0.6) {
                            addWindow(roomCenterX - bedWidth/4, winY, houseBackZ, winW, winH, 'X', layer);
                            addWindow(roomCenterX + bedWidth/4, winY, houseBackZ, winW, winH, 'X', layer);
                        }
                    } else {
                        // 1 window
                        const winW = Math.max(0.6, Math.min(maxWinW, bedWidth - 0.8));
                        if (winW >= 0.6) addWindow(roomCenterX, winY, houseBackZ, winW, winH, 'X', layer);
                    }
                    
                    // Add Bed
                    // Rotate the bed 90 degrees and push it against a side wall
                    // This guarantees the door swing will NEVER hit the bed!
                    const bedRot = (i % 2 === 0) ? Math.PI / 2 : -Math.PI / 2;
                    const bedX = (i % 2 === 0) ? roomLeftX + 1.1 : roomLeftX + bedWidth - 1.1;
                    buildFurniture('bed', bedX, houseBackZ + 0.85, bedRot, layer, null, baseY);
                    
                    const area = Math.round(bedWidth * bedDepth * 10) / 10;
                    const label = createTextSprite(`Bedroom ${i + 1}\n(${area} sqm)`, layer);
                    label.position.set(roomCenterX, 20, houseBackZ + bedDepth / 2);
                    blueprintGroup.add(label);
                }
            }
        }

        // --- COMFORT ROOMS (CRs) ---
        if (crs > 0) {
            let crPlacements = [];
            
            if (beds > 0) {
                // safeCrWidth and safeCrDepth were pre-calculated above!
                const bedWidth = (beds === 1) ? Math.min(4.5, (flL - wt) * 0.60) : Math.min(4.5, (flL - wt) / beds);
                
                // 1st CR is always Common
                crPlacements.push({ type: 'common', x: houseLeftX + safeCrWidth/2, z: houseFrontZ - safeCrDepth/2, width: safeCrWidth, depth: safeCrDepth });
                
                // 2nd CR and beyond are En-suites distributed among bedrooms
                for (let i = 1; i < crs; i++) {
                    const bedIndex = (i - 1) % beds; // Distribute across available bedrooms
                    const roomLeftX = houseLeftX + bedIndex * bedWidth;
                    crPlacements.push({ type: 'ensuite', x: roomLeftX + safeCrWidth/2, z: houseBackZ + bedDepth - safeCrDepth/2, width: safeCrWidth, depth: safeCrDepth });
                }
            } else {
                let fallbackCrDepth = Math.min(1.8, flW * ((flW <= 7) ? 0.25 : 0.20));
                let fallbackCrWidth = Math.min(1.8, (flL - wt) / crs);
                for (let i = 0; i < crs; i++) {
                    crPlacements.push({ type: 'common', x: houseLeftX + fallbackCrWidth/2 + i*fallbackCrWidth, z: houseFrontZ - fallbackCrDepth/2, width: fallbackCrWidth, depth: fallbackCrDepth });
                }
            }
            
            crPlacements.forEach((cr, i) => {
                const crWidth = cr.width;
                const crDepth = cr.depth;
                const crLeftX = cr.x - crWidth/2;
                const crRightX = cr.x + crWidth/2;
                const crBackZ = cr.z - crDepth/2;
                const crFrontZ = cr.z + crDepth/2;
                
                // Walls
                // Added +wt to lengths/depths to ensure seamless overlaps at the corners
                box(crWidth + wt, wallH, wt, cr.x, cy, crFrontZ, mat, wallGroup, true, "wall", layer);
                box(crWidth + wt, wallH, wt, cr.x, cy, crBackZ, mat, wallGroup, true, "wall", layer);
                box(wt, wallH, crDepth + wt, crLeftX, cy, cr.z, mat, wallGroup, true, "wall", layer);
                box(wt, wallH, crDepth + wt, crRightX, cy, cr.z, mat, wallGroup, true, "wall", layer);
                
                if (isBaseFloor) {
                    const dW = 0.7;
                    const doorX = crRightX;
                    
                    box(wt + 0.04, dH, dW, doorX, baseY + dH/2, cr.z, doorMat, wallGroup, false, "door", layer);
                    doorknob(0.035, wt + 0.14, doorX, baseY + 1.0, cr.z + dW/2 - 0.1, knobMat, wallGroup, layer, 'X'); // Knob
                    addBlueprintDoorSymbol(doorX, cr.z, dW, 'cr', layer);
                    
                    // CR Awning Window (Exterior)
                    let winX = null, winZ = null, winAxis = null;
                    if (Math.abs(crBackZ - houseBackZ) < 0.1) { winX = cr.x; winZ = houseBackZ; winAxis = 'X'; }
                    else if (Math.abs(crLeftX - houseLeftX) < 0.1) { winX = houseLeftX; winZ = cr.z; winAxis = 'Z'; }
                    else if (Math.abs(crRightX - houseRightX) < 0.1) { winX = houseRightX; winZ = cr.z; winAxis = 'Z'; }
                    else if (Math.abs(crFrontZ - houseFrontZ) < 0.1) { winX = cr.x; winZ = houseFrontZ; winAxis = 'X'; }
                    
                    if (winX !== null) addWindow(winX, baseY + availableH - 0.6, winZ, 0.6, 0.6, winAxis, layer);
                    
                    // Furnish the CR dynamically based on Window Position
                    let toiletX = cr.x, toiletZ = cr.z, toiletRot = 0;
                    if (winZ === houseBackZ || winZ === crBackZ) {
                        // Window on Back (-Z) wall
                        toiletX = cr.x;
                        toiletZ = crBackZ + wt/2 + 0.25;
                        toiletRot = 0; // Faces +Z
                    } else if (winZ === houseFrontZ || winZ === crFrontZ) {
                        // Window on Front (+Z) wall
                        toiletX = cr.x;
                        toiletZ = crFrontZ - wt/2 - 0.25;
                        toiletRot = Math.PI; // Faces -Z
                    } else if (winX === houseLeftX || winX === crLeftX) {
                        // Window on Left (-X) wall
                        toiletX = crLeftX + wt/2 + 0.25;
                        toiletZ = cr.z;
                        toiletRot = Math.PI / 2; // Faces +X
                    } else if (winX === houseRightX || winX === crRightX) {
                        // Window on Right (+X) wall
                        toiletX = crRightX - wt/2 - 0.25;
                        toiletZ = cr.z;
                        toiletRot = -Math.PI / 2; // Faces -X
                    }
                    
                    buildFurniture('toilet', toiletX, toiletZ, toiletRot, layer, null, baseY);
                    
                    const area = Math.round(crWidth * crDepth * 10) / 10;
                    const label = createTextSprite(`CR ${i + 1}\n(${area} sqm)`, layer);
                    label.position.set(cr.x, 20, cr.z);
                    blueprintGroup.add(label);
                }
            });
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
            // Window Sill
            box(wt+0.08, 0.08, ww+0.1, wx, wy-wh/2, wz, fascMat, wallGroup, false, "wall", layer);
        } else {
            box(ww, wh, wt+0.04, wx, wy, wz, glassMat, wallGroup, false, "wall", layer);
            box(ww+0.06, 0.06, wt+0.06, wx, wy+wh/2, wz, frameMat, wallGroup, false, "wall", layer);
            box(ww+0.06, 0.06, wt+0.06, wx, wy-wh/2, wz, frameMat, wallGroup, false, "wall", layer);
            box(0.06, wh+0.06, wt+0.06, wx-ww/2, wy, wz, frameMat, wallGroup, false, "wall", layer);
            box(0.06, wh+0.06, wt+0.06, wx+ww/2, wy, wz, frameMat, wallGroup, false, "wall", layer);
            box(0.03, wh, wt+0.06, wx, wy, wz, frameMat, wallGroup, false, "wall", layer);
            // Window Sill
            box(ww+0.1, 0.08, wt+0.08, wx, wy-wh/2, wz, fascMat, wallGroup, false, "wall", layer);
        }
        addBlueprintWindowSymbol(wx, wz, ww, axis, layer);
    }

    let groundWallH = H1;
    if (type === 'Half Amakan' || type === 'Half Metal') groundWallH = totalH;

    const frontX = L/2 - wt/2;

    // --- Ground Floor Door & Window Sizing ---
    const doorH  = Math.min(2.4, groundWallH * 0.85);
    const doorW2 = Math.min(1.1, W * 0.25);
    const doorX  = frontX;
    const doorY  = doorH / 2;

    // Center door in the Living / Kitchen area
    let groundBedFrontZ = -W/2;
    let actualBedFrontZ = -W/2;
    if (bed1 > 0) {
        let bedDepthPercent = 0.45;
        if (W <= 7) bedDepthPercent = 0.50;
        if (W <= 5) bedDepthPercent = 0.55;
        const bedDepth = Math.min(4.5, W * bedDepthPercent);
        const hallwayWidth = (W - bedDepth < 3.0) ? 0 : 1.0;
        actualBedFrontZ = -W/2 + bedDepth;
        groundBedFrontZ = actualBedFrontZ + hallwayWidth; // End of hallway
    }
    const doorZ  = (groundBedFrontZ + W/2) / 2;

    const win1Y = groundWallH * 0.55;
    const win1H = groundWallH * 0.45;
    
    const doorEdgeZ = doorZ - doorW2 / 2;
    const cornerZ = -W / 2 + 0.2;
    const spaceW = Math.abs(doorEdgeZ - cornerZ);
    
    const winW = Math.max(0.2, Math.min(1.3, spaceW * 0.85));
    const win1Z = (doorEdgeZ + cornerZ) / 2;

    // --- Single front face window for Ground Floor ---
    addWindow(frontX, win1Y, win1Z, winW, win1H, 'Z', layer1F);
    
    // Exterior Plant Box under front window
    box(0.4, 0.4, winW + 0.4, frontX + 0.2, 0.2, win1Z, wallMat2, wallGroup, true, "decor", layer1F);
    box(0.3, 0.45, winW + 0.3, frontX + 0.2, 0.225, win1Z, plantMat, wallGroup, true, "decor", layer1F);

    // --- Dynamic Side Windows for Living/Kitchen (+Z wall) ---
    // The +Z wall spans from X = -L/2 to +L/2. CRs might be at the back-left (-X, +Z corner).
    let livingSideStartX = -L/2 + wt/2;
    if (cr1 > 0) {
        if (bed1 > 0) {
            // Only 1 CR is on the living side wall (the common CR)
            const bedWidth = (bed1 === 1) ? Math.min(4.5, (L - wt) * 0.60) : Math.min(4.5, (L - wt) / bed1);
            let safeCrWidth = Math.min(1.8, (L - wt) / cr1);
            safeCrWidth = Math.max(0.8, Math.min(safeCrWidth, bedWidth * 0.50));
            livingSideStartX += safeCrWidth; // Skip only the 1 common CR footprint
        } else {
            // All CRs are on the living side wall
            const fallbackCrWidth = Math.min(1.8, (L - wt) / cr1);
            livingSideStartX += (fallbackCrWidth * cr1); // Skip all CR footprints
        }
    }
    if (type === 'Loft Style') {
        // Stairs are built under the mezzanine edge on the +Z wall.
        // The mezzanine edge is at -L/2 + L2. We must start the living space AFTER the stairs.
        livingSideStartX = Math.max(livingSideStartX, -L/2 + L2);
    }
    const livingSideEndX = frontX - 0.8; // Leave room near the front corner
    
    const availableSideL = livingSideEndX - livingSideStartX;
    if (availableSideL > 1.5) {
        const numSideWins = Math.max(1, Math.floor(availableSideL / 3.0));
        const spacing = availableSideL / (numSideWins + 1);
        for (let i = 1; i <= numSideWins; i++) {
            const wx = livingSideStartX + spacing * i;
            addWindow(wx, win1Y, W/2 - wt/2, 1.2, win1H, 'X', layer1F);
        }
    }

    // --- Dynamic Side Windows for Living/Kitchen (-Z wall) ---
    // The -Z wall has bedrooms starting from the back (-X).
    let livingOtherSideStartX = -L/2 + wt/2;
    if (bed1 > 0) {
        const bedWidth = (bed1 === 1) ? Math.min(4.5, (L - wt) * 0.60) : Math.min(4.5, (L - wt) / bed1);
        livingOtherSideStartX += (bedWidth * bed1); // Skip all bedroom footprints
    }
    const availableOtherSideL = livingSideEndX - livingOtherSideStartX;
    if (availableOtherSideL > 1.5) {
        const numOtherWins = Math.max(1, Math.floor(availableOtherSideL / 3.0));
        const spacing2 = availableOtherSideL / (numOtherWins + 1);
        for (let i = 1; i <= numOtherWins; i++) {
            const wx = livingOtherSideStartX + spacing2 * i;
            // For the window furthest back, style it as a Kitchen Sink window
            if (i === 1 && availableOtherSideL > 3.0) {
                 addWindow(wx, win1Y + 0.3, -W/2 + wt/2, 1.0, win1H - 0.3, 'X', layer1F); 
            } else {
                 addWindow(wx, win1Y, -W/2 + wt/2, 1.2, win1H, 'X', layer1F);
            }
        }
    }

    // --- Dynamic front face windows for 2nd Floor (if applicable) ---
    if (type === 'Two Storey') {
        const ox = (L - L2) / 2;
        const oz = (W - W2) / 2;
        const frontX2 = -ox + L2/2 - wt/2;
        const topWallH = (type === 'Two Storey') ? H2 : 1.5;
        const win2Y = H1 + topWallH * 0.55;
        const win2H = topWallH * 0.45;
        
        // Calculate the exact Z-position of the bedroom interior wall
        let bedDepthPercent = 0.45;
        if (W2 <= 7) bedDepthPercent = 0.50;
        if (W2 <= 5) bedDepthPercent = 0.55;
        const bedDepth = Math.min(4.5, W2 * bedDepthPercent);
        const houseBackZ2 = -oz - W2/2;
        const houseFrontZ2 = -oz + W2/2;
        const bedFrontZ2 = houseBackZ2 + bedDepth;
        
        // Window 1: Bedroom side (Left side of the front facade)
        const bedWinWidth = bedDepth * 0.6;
        const bedWinZ = (houseBackZ2 + bedFrontZ2) / 2;
        addWindow(frontX2, win2Y, bedWinZ, bedWinWidth, win2H, 'Z', 2);
        
        // Window 2: Stairwell side (Right side of the front facade)
        const hallWidth = houseFrontZ2 - bedFrontZ2;
        const hallWinWidth = hallWidth * 0.6;
        const hallWinZ = (bedFrontZ2 + houseFrontZ2) / 2;
        addWindow(frontX2, win2Y, hallWinZ, hallWinWidth, win2H, 'Z', 2);
    }

    // ---- 3. FRONT DOOR (on +X face) ----
    box(wt+0.04, doorH, doorW2, doorX, doorY, doorZ, doorMat, wallGroup, false, "door", layer1F);
    doorknob(0.035, wt + 0.14, doorX, doorY - 0.1, doorZ + doorW2/2 - 0.1, knobMat, wallGroup, layer1F, 'X'); // Knob
    box(wt+0.06, doorH*0.5, doorW2*0.4, doorX, doorY+doorH*0.1, doorZ, doorGlsMat, wallGroup, false, "door", layer1F);
    box(wt+0.06, 0.08, doorW2+0.1, doorX, doorH-0.04, doorZ, frameMat, wallGroup, false, "door", layer1F); // top
    box(wt+0.06, doorH, 0.06, doorX, doorY, doorZ - doorW2/2 - 0.03, frameMat, wallGroup, false, "door", layer1F); // left
    box(wt+0.06, doorH, 0.06, doorX, doorY, doorZ + doorW2/2 + 0.03, frameMat, wallGroup, false, "door", layer1F); // right
    
    addBlueprintDoorSymbol(doorX, doorZ, doorW2, 'front', layer1F);

    // ---- 4. MAIN ENTRANCE PORCH ----
    const porchD = 1.2; // Sticks out 1.2m from the house
    let porchW = doorW2 + 0.6; // 0.3m extra on each side of the door
    
    // Ensure porch doesn't stick out past the house corners
    let porchCenterZ = doorZ;
    if (porchCenterZ + porchW/2 > W/2) porchCenterZ = W/2 - porchW/2;
    if (porchCenterZ - porchW/2 < -W/2) porchCenterZ = -W/2 + porchW/2;

    const porchCX = doorX + porchD/2; // Center of porch is outside the wall
    
    // Porch Slab (w=X-axis depth, d=Z-axis width)
    box(porchD, 0.15, porchW, porchCX, 0.075, porchCenterZ, slabMat, slabGroup, true, "porch", baseLayer);
    
    // Porch Steps
    const stepD = 0.3;
    const stepCX = doorX + porchD + stepD/2;
    box(stepD, 0.08, porchW, stepCX, 0.04, porchCenterZ, slabMat, slabGroup, true, "porch", baseLayer);
    
    const porchLabel = createTextSprite('Porch', layer1F);
    porchLabel.position.set(porchCX, 20, porchCenterZ);
    blueprintGroup.add(porchLabel);

    // ---- 5. FLOOR SLAB ----
    // Calculate Living Area properly for the label
    let livingArea = (L * W);
    // Rough subtraction of bedrooms/CRs (handled more precisely in cost, but this is a rough visual label)
    if (bed1 > 0) livingArea -= (L * W) * 0.45; 
    livingArea = Math.round(livingArea * 10) / 10;
    
    const mainLabelLayer = (type === 'Two Storey' || type === 'Loft Style') ? 1 : 0;
    const mainLabel = createTextSprite(`Living / Kitchen\n(${livingArea} sqm)`, mainLabelLayer);
    mainLabel.position.set(L * 0.25, 20, doorZ);
    blueprintGroup.add(mainLabel);

    // --- INTERIOR FURNISHING (LIVING / KITCHEN) ---
    const availSpaceKit = frontX - livingOtherSideStartX; // Kitchen is on -Z wall (near bedrooms)
    const availSpaceTV = frontX - livingSideStartX;       // TV is on +Z wall (near CRs)
    
    // Dynamically scale furniture based on available space to prevent clipping
    const maxSofaW = Math.min(2.0, Math.max(0.8, Math.min(availSpaceKit, availSpaceTV) - 0.4));
    const maxTvW = Math.min(1.5, Math.max(0.8, availSpaceTV - 0.4));

    // Calculate shift to ensure we never clip the CR partition wall
    let tvX = (frontX + livingSideStartX) / 2;
    const safeShift = Math.max(0, (availSpaceTV / 2) - (maxTvW / 2) - 0.2);
    const shiftX = Math.min(0.4, safeShift); 
    tvX -= shiftX; // Shift slightly to the right if space permits
    
    const tvZ = W/2 - wt/2 - 0.2;
    buildFurniture('tv', tvX, tvZ, Math.PI, layer1F, maxTvW);
    
    // Sofa facing the TV, dynamic distance based on room width
    const sofaX = tvX;
    const tvSofaDist = Math.min(2.0, Math.max(1.2, W * 0.35));
    const sofaZ = tvZ - tvSofaDist;
    buildFurniture('sofa', sofaX, sofaZ, 0, layer1F, maxSofaW);
    
    // Kitchen Counter
    let kitW, kitX, kitZ, kitRot;
    if (availSpaceKit >= 1.5) {
        // Enough space on the back wall (-Z) next to the bedrooms
        kitW = Math.min(2.0, Math.max(0.8, availSpaceKit - 0.5));
        kitX = livingOtherSideStartX + kitW/2 + 0.2;
        kitZ = -W/2 + wt/2 + 0.5;
        kitRot = 0;
    } else {
        // Bedrooms take up most of the back wall. Place kitchen in the living area.
        const maxKitOnRight = (doorZ - doorW2/2) - groundBedFrontZ - 0.2;
        
        // Place on the left wall (CR wall)
        // Need to avoid the CR door which is at crDoorZ = houseFrontZ - crDepth/2
        const crDepthApprox = 1.8;
        const crDoorZ = (W/2 - wt/2) - crDepthApprox/2;
        const spaceBeforeDoor = (crDoorZ - 0.4) - groundBedFrontZ;
        const spaceAfterDoor = (W/2 - wt/2) - (crDoorZ + 0.4);
        
        if (spaceBeforeDoor >= 0.8) {
            kitW = Math.min(2.0, spaceBeforeDoor - 0.2);
            kitX = livingSideStartX + 0.5;
            kitZ = groundBedFrontZ + kitW/2 + 0.1;
            kitRot = Math.PI/2;
        } else if (spaceAfterDoor >= 0.8) {
            kitW = Math.min(2.0, spaceAfterDoor - 0.2);
            kitX = livingSideStartX + 0.5;
            kitZ = crDoorZ + 0.4 + kitW/2 + 0.1;
            kitRot = Math.PI/2;
        } else {
            // Force it on the right wall
            // Make it flush against the actual bedroom wall (actualBedFrontZ + wt) 
            // and flush against the front wall (frontX - 0.4)
            const bedWallFrontFace = actualBedFrontZ + 0.2; // wt is 0.2
            const spaceForKit = (doorZ - doorW2/2 - 0.2) - bedWallFrontFace;
            kitW = Math.max(0.6, Math.min(2.5, spaceForKit));
            kitX = frontX - 0.4; // 0.3 (half of kitchen depth 0.6) + 0.1 (half of wall wt 0.2)
            kitZ = bedWallFrontFace + kitW/2; // Starts exactly at the bedroom wall's surface
            kitRot = -Math.PI/2;
        }
    }
    buildFurniture('kitchen', kitX, kitZ, kitRot, layer1F, kitW);

    // Dining Table (dynamically centered between the living area and kitchen)
    let diningX, diningZ;
    let maxDiningW = Math.min(1.2, Math.max(0.7, (frontX - livingSideStartX) * 0.3));
    let diningRot = Math.PI/2;
    
    if (availSpaceKit >= 1.5) {
        diningX = (sofaX + kitX) / 2;
        diningZ = (sofaZ + kitZ) / 2;
        // Push dining slightly to the right (+X) if cramped
        if (Math.min(availSpaceKit, availSpaceTV) < 2.5) {
            diningX += 0.2;
        }
    } else {
        // Kitchen is on a side wall. 
        // Place the dining table directly between the TV and sofa to act as a center/coffee table
        diningX = sofaX;
        diningZ = (sofaZ + tvZ) / 2;
        diningRot = 0; // Rotate to align with TV and Sofa
        maxDiningW = Math.min(1.0, Math.max(0.6, tvSofaDist - 0.6)); // Scale based on TV-Sofa distance
    }
    
    buildFurniture('dining', diningX, diningZ, diningRot, layer1F, maxDiningW);

    box(L, 0.2, W, 0, 0.1, 0, slabMat, slabGroup, true, "wall", baseLayer);
    if (needsSlab) {
        const slX = -(L-L2)/2;
        const slZ = -(W-W2)/2;
        
        // Calculate exactly how much space is available before hitting the bedrooms
        let bedDepthPercent = 0.45;
        if (W2 <= 7) bedDepthPercent = 0.50;
        if (W2 <= 5) bedDepthPercent = 0.55;
        const bedDepth = Math.min(4.5, W2 * bedDepthPercent);
        const maxHallwayDepth = W2 - bedDepth;
        
        // Define COMPRESSED L-shaped stairwell dimensions
        const sw = 1.6; // Compressed width
        const sd = Math.min(2.1, maxHallwayDepth - 0.1); // Keep it just inside the hallway
        const landingSize = sw / 2;
        
        // The user requested to maximize 2nd floor space by flooring over the lower flight and landing.
        // The hole will ONLY be cut for the upper flight (Flight 2) which connects to the floor.
        const holeW = sw;
        const holeD = landingSize;
        
        // Piece 1: Back slab (Covers everything behind Flight 2, including covering Flight 1 and the landing)
        const p1D = W2 - holeD;
        if (p1D > 0.05) {
            box(L2, 0.18, p1D, slX, H1, slZ - W2/2 + p1D/2, slabMat2, slabGroup, true, "wall", 2);
        }
        
        // Piece 2: Left slab (Covers the space beside Flight 2 at the front of the house)
        const p2W = L2 - holeW;
        if (p2W > 0.05) {
            box(p2W, 0.18, holeD, slX - L2/2 + p2W/2, H1, slZ + W2/2 - holeD/2, slabMat2, slabGroup, true, "wall", 2);
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

        // Column with slight taper for realism (0.25 width)
        box(0.25, actualH, 0.25, cx, actualH/2, cz, colMat, columnGroup, true, "wall", baseLayer);
        // Capital (top plate)
        box(0.34, 0.08, 0.34, cx, actualH-0.04, cz, colMat, columnGroup, true, "wall", baseLayer);
    }

    const cXMin = -L/2 + 0.125;
    const cXMax = L/2 - 0.125;
    const cZMin = -W/2 + 0.125;
    const cZMax = W/2 - 0.125;

    addCol(cXMin, cZMin, totalH); addCol(cXMax, cZMin, totalH);
    addCol(cXMin, cZMax, totalH); addCol(cXMax, cZMax, totalH);
    
    const nL = Math.max(0, Math.floor(L/3)-1);
    const nW = Math.max(0, Math.floor(W/3)-1);
    for(let i=1;i<=nL;i++){
        const cx = -L/2 + L*i/(nL+1);
        addCol(cx, cZMin, totalH); addCol(cx, cZMax, totalH);
    }
    for(let i=1;i<=nW;i++){
        const cz = -W/2 + W*i/(nW+1);
        addCol(cXMin, cz, totalH); addCol(cXMax, cz, totalH);
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
        box(L, 0.06, W, 0, H1-0.03, 0, ceilingMat, roofGroup, true, "ceiling");
    }
    if ((type==='Two Storey'||type==='Loft Style') && hasCeiling2) {
        const ox=-(L-L2)/2, oz=-(W-W2)/2;
        box(L2, 0.06, W2, ox, totalH-0.03, oz, ceilingMat, roofGroup, true, "ceiling");
    }

    // ---- 9. STANDARD DRAWING ELEMENTS ----
    // Note on coordinates for Floor Plan Camera:
    // UP on screen is -X
    // DOWN on screen is +X
    // LEFT on screen is +Z
    // RIGHT on screen is -Z

    // North Arrow
    const northGroup = new THREE.Group();
    // Position at Top-Right of the layout
    const nx = -L/2 - 2; 
    const nz = -W/2 - 2;

    // Draw circle for North Arrow
    const curve = new THREE.EllipseCurve(0, 0, 0.4, 0.4, 0, 2*Math.PI, false, 0);
    const nPts = curve.getPoints(32).map(p => new THREE.Vector3(p.x, 20.2, p.y));
    const nCircle = new THREE.Line(new THREE.BufferGeometry().setFromPoints(nPts), fpLineMat);
    northGroup.add(nCircle);

    // Arrow head pointing UP (-X direction on screen)
    const arrowPts = [
        new THREE.Vector3(-0.1, 20.2, -0.15),
        new THREE.Vector3(-0.7, 20.2, 0),
        new THREE.Vector3(-0.1, 20.2, 0.15)
    ];
    const nArrow = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arrowPts), fpLineMat);
    northGroup.add(nArrow);

    const nText = createTextSprite("N", 0);
    nText.position.set(0, 20.3, 0);
    nText.scale.set(1.0, 0.5, 1);
    northGroup.add(nText);
    northGroup.position.set(nx, 0, nz);
    blueprintGroup.add(northGroup);

    // Scale Bar
    const scaleGroup = new THREE.Group();
    // Position at Bottom-Left of the layout
    const sx = L/2 + 2.5;
    const sz = W/2;

    // 0 to 5m scale bar (horizontal on screen means along Z axis)
    // Left is +Z, Right is -Z. So we draw from 0 to -scaleLen.
    const scaleLen = Math.min(5, Math.floor(L)); // if house is small, scale to length
    const sPts = [
        new THREE.Vector3(0, 20.2, 0),
        new THREE.Vector3(0, 20.2, -scaleLen)
    ];
    const sLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(sPts), fpLineMat);
    scaleGroup.add(sLine);

    // Ticks (vertical on screen means along X axis)
    [0, 1, scaleLen].forEach(val => {
        const tickPts = [
            new THREE.Vector3(-0.15, 20.2, -val),
            new THREE.Vector3(0.15, 20.2, -val)
        ];
        const tick = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPts), fpLineMat);
        scaleGroup.add(tick);

        // Position text below the tick (DOWN is +X)
        const txt = createTextSprite(val + "m", 0);
        txt.position.set(0.4, 20.3, -val);
        txt.scale.set(0.7, 0.35, 1);
        scaleGroup.add(txt);
    });

    // Position label above the scale bar (UP is -X)
    const scaleTxt = createTextSprite("SCALE METER", 0);
    scaleTxt.position.set(-0.4, 20.3, -scaleLen/2);
    scaleTxt.scale.set(1.5, 0.75, 1);
    scaleGroup.add(scaleTxt);
    
    scaleGroup.position.set(sx, 0, sz);
    blueprintGroup.add(scaleGroup);
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
let xrayState = {
    roof: true,
    walls: true,
    slabs: true,
    columns: true,
    floor2: true
};

function animate() {
    requestAnimationFrame(animate);

    const houseType = window.currentRendererHouseType;
    const isSplit = (houseType === 'Two Storey' || houseType === 'Loft Style');

    controlsExt.update();
    controlsFP1.update();
    if (isSplit) controlsFP2.update();

    // 1. Exterior Render (Normal 3D)
    roofGroup.visible  = xrayState.roof;
    wallGroup.visible  = xrayState.walls;
    // Floor slab visibility is fully independent and controlled only by its own toggle
    slabGroup.visible  = xrayState.slabs;
    columnGroup.visible = xrayState.columns;
    
    // Toggle 2nd floor items by toggling the camera's ability to see Layer 2
    if (xrayState.floor2) {
        cameraExt.layers.enable(2);
    } else {
        cameraExt.layers.disable(2);
    }

    // Hide the ceiling (the "white slab" attached to the roof) when walls are OFF
    roofGroup.children.forEach(c => {
        if (c.userData.type === "ceiling") {
            c.visible = xrayState.walls;
        }
    });

    blueprintGroup.visible = false;
    rendererExt.render(scene, cameraExt);

    // 2. Blueprint Render (2D Floor Plan) — switch scene to blueprint mode
    const bg = scene.background;
    scene.background = new THREE.Color(0xffffff);
    
    // Force visibility for blueprint render (ignoring X-Ray)
    roofGroup.visible = false;
    wallGroup.visible = true;
    slabGroup.visible = true;
    columnGroup.visible = true;
    
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
        oldVis.set(c, c.visible);
        if (c.userData.type === "stair" || c.userData.type === "furniture" || c.userData.type === "porch") { c.visible = false; }
        else if (c.material && c.material.color && c.material.color.getHex() !== 0x4488ff) { c.material = fpSlabMat; }
    });

    columnGroup.children.forEach(c => {
        oldMats.set(c, c.material);
        c.material = fpWallMat;
    });

    // Show/hide second floor panel in DOM
    const panel2El = document.getElementById('fp-panel-2');
    const badge1El = document.getElementById('fp-badge-1');
    const badge2El = document.getElementById('fp-badge-2');
    if (panel2El) panel2El.style.display = isSplit ? '' : 'none';
    if (badge1El) badge1El.textContent = isSplit ? '1ST FLOOR' : 'TOP VIEW';
    if (badge2El) badge2El.textContent = (houseType === 'Loft Style') ? 'MEZZANINE' : '2ND FLOOR';

    // Update camera 1 aspect ratio
    if (fpContainer1) {
        const w1 = fpContainer1.clientWidth, h1 = fpContainer1.clientHeight;
        if (w1 > 0 && h1 > 0) {
            const a1 = w1 / h1;
            cameraFP1.left = -fpD * a1; cameraFP1.right = fpD * a1;
            cameraFP1.top = fpD; cameraFP1.bottom = -fpD;
            cameraFP1.updateProjectionMatrix();
            rendererFP1.setSize(w1, h1);
        }
    }

    // Render Floor 1
    // Single-story: outer walls are on layer 0 (baseLayer=0), rooms on layer 1
    // Two-story/loft: outer base walls are on layer 3 (baseLayer=3), rooms on layer 1
    // Enabling layer 0 on a split build would bleed 2nd-floor objects through, so keep separate.
    cameraFP1.layers.disableAll();
    if (isSplit) {
        // Two-story / Loft: base walls on layer 3, floor-1 rooms on layer 1
        cameraFP1.layers.enable(1);
        cameraFP1.layers.enable(3);
    } else {
        // Single-story: outer walls on layer 0, interior rooms on layer 1
        cameraFP1.layers.enable(0);
        cameraFP1.layers.enable(1);
    }
    if (fpContainer1) rendererFP1.render(scene, cameraFP1);


    // Render Floor 2 independently (only when split)
    if (isSplit && fpContainer2 && fpContainer2.offsetParent !== null) {
        const w2 = fpContainer2.clientWidth, h2 = fpContainer2.clientHeight;
        if (w2 > 0 && h2 > 0) {
            const a2 = w2 / h2;
            cameraFP2.left = -fpD * a2; cameraFP2.right = fpD * a2;
            cameraFP2.top = fpD; cameraFP2.bottom = -fpD;
            cameraFP2.updateProjectionMatrix();
            rendererFP2.setSize(w2, h2);
        }
        cameraFP2.layers.disableAll();
        cameraFP2.layers.enable(2);
        rendererFP2.render(scene, cameraFP2);
    }

    // Restore state
    scene.background = bg;
    blueprintGroup.visible = false;

    wallGroup.children.forEach(c => { c.material = oldMats.get(c); c.visible = oldVis.get(c); });
    slabGroup.children.forEach(c => { c.material = oldMats.get(c); c.visible = oldVis.get(c); });
    columnGroup.children.forEach(c => { c.material = oldMats.get(c); });
}

// ============================================================
//  RESIZE
// ============================================================
window.addEventListener('resize', () => {
    cameraExt.aspect = extContainer.clientWidth / extContainer.clientHeight;
    cameraExt.updateProjectionMatrix();
    rendererExt.setSize(extContainer.clientWidth, extContainer.clientHeight);

    if (fpContainer1) {
        const a1 = fpContainer1.clientWidth / fpContainer1.clientHeight;
        cameraFP1.left = -fpD*a1; cameraFP1.right = fpD*a1;
        cameraFP1.top = fpD; cameraFP1.bottom = -fpD;
        cameraFP1.updateProjectionMatrix();
        rendererFP1.setSize(fpContainer1.clientWidth, fpContainer1.clientHeight);
    }

    if (fpContainer2) {
        const a2 = fpContainer2.clientWidth / Math.max(1, fpContainer2.clientHeight);
        cameraFP2.left = -fpD*a2; cameraFP2.right = fpD*a2;
        cameraFP2.top = fpD; cameraFP2.bottom = -fpD;
        cameraFP2.updateProjectionMatrix();
        rendererFP2.setSize(fpContainer2.clientWidth, fpContainer2.clientHeight);
    }
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

    // ── Auto-fit exterior camera to house bounding box ───────────────────
    // Compute a bounding box over the entire house group
    const bbox = new THREE.Box3().setFromObject(houseGroup);
    const center = new THREE.Vector3();
    const size   = new THREE.Vector3();
    bbox.getCenter(center);
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 10;

    // Position camera at a cinematic diagonal angle and aim at house center
    cameraExt.position.set(
        center.x + maxDim * 1.55,
        center.y + maxDim * 0.55,
        center.z + maxDim * 0.85
    );
    controlsExt.target.copy(center);
    cameraExt.near = 0.1;
    cameraExt.far  = maxDim * 20;
    cameraExt.updateProjectionMatrix();
    controlsExt.update();

    animate();

    // ── X-Ray Visibility Toggles ──────────────────────────────────────────
    const xrayRoof = document.getElementById('xray-roof');
    const xrayWalls = document.getElementById('xray-walls');
    const xraySlabs = document.getElementById('xray-slabs');
    const xrayColumns = document.getElementById('xray-columns');
    const xrayFloor2 = document.getElementById('xray-floor2');
    const xrayFloor2Container = document.getElementById('xray-floor2-container');

    // Show 2nd Floor toggle only if applicable
    if (xrayFloor2Container) {
        const hType = window.currentRendererHouseType;
        if (hType === 'Two Storey' || hType === 'Loft Style') {
            xrayFloor2Container.style.display = 'inline-flex';
        } else {
            xrayFloor2Container.style.display = 'none';
        }
    }

    // Initialize state based on UI
    if (xrayRoof) xrayState.roof = xrayRoof.checked;
    if (xrayWalls) xrayState.walls = xrayWalls.checked;
    if (xraySlabs) xrayState.slabs = xraySlabs.checked;
    if (xrayColumns) xrayState.columns = xrayColumns.checked;
    if (xrayFloor2) xrayState.floor2 = xrayFloor2.checked;

    // Listeners for UI interaction
    if (xrayRoof) xrayRoof.addEventListener('change', (e) => { xrayState.roof = e.target.checked; });
    if (xrayWalls) xrayWalls.addEventListener('change', (e) => { xrayState.walls = e.target.checked; });
    if (xraySlabs) xraySlabs.addEventListener('change', (e) => { xrayState.slabs = e.target.checked; });
    if (xrayColumns) xrayColumns.addEventListener('change', (e) => { xrayState.columns = e.target.checked; });
    if (xrayFloor2) {
        xrayFloor2.addEventListener('change', (e) => { 
            xrayState.floor2 = e.target.checked; 
            if (!e.target.checked && xrayRoof) {
                // Auto-hide roof when hiding 2nd floor for a better top-down view
                xrayRoof.checked = false;
                xrayState.roof = false;
            }
        });
    }
}

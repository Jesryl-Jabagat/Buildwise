const L = 6;
const W = 7;
const flL = 6;
const flW = 7;
const beds = 2;
const wt = 0.1;
const bedDepthPercent = 0.45;
const bedDepth = Math.min(3.8, flW * bedDepthPercent);
const bedFrontZ = -flW/2 + bedDepth;
const bedWidth = Math.min(4.5, (flL - wt*2) / beds);
const totalBedWidth = bedWidth * beds;

console.log("flL:", flL, "bedWidth:", bedWidth);

for (let i = 0; i < beds; i++) {
    const roomLeftX = -flL/2 + wt + i * bedWidth;
    const roomCenterX = roomLeftX + bedWidth / 2;
    
    let dW = 0.8;
    if (bedWidth < 2.0) dW = 0.7;
    const doorX = roomLeftX + dW/2 + 0.2; // Place near corner to avoid overlap
    
    console.log(`Bedroom ${i+1}`);
    console.log(`  roomLeftX: ${roomLeftX.toFixed(2)}`);
    console.log(`  doorX: ${doorX.toFixed(2)}`);
    console.log(`  Partition wall (if i>0) is at: ${roomLeftX.toFixed(2)}`);
    
    // door symbol logic
    let hx = doorX + dW/2;
    let arcMax = hx;
    let arcMin = hx - dW;
    
    console.log(`  Hinge X: ${hx.toFixed(2)}`);
    console.log(`  Arc swings from X=${arcMin.toFixed(2)} to X=${arcMax.toFixed(2)}`);
}

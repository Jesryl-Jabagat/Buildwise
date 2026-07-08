import * as F from "../formulas/index.js";
import { sumObjects, validateInputs } from "../../utils/calc-helpers.js";

export function estimate(data) {
  const error = validateInputs(data, "loft");
  if (error) return error;

  const L = data.length || data.groundLength || 0;
  const W = data.width || data.groundWidth || 0;
  const wallHeight = data.wallHeight || data.groundWallHeight || 2.7;
  
  const mezzanineLength = data.mezzanineLength || 0;
  const mezzanineWidth = data.mezzanineWidth || 0;
  const floor2Area = mezzanineLength * mezzanineWidth;
  
  if (floor2Area > (L * W * 0.50)) {
    return "Error: Mezzanine area cannot exceed 50% of the ground floor area.";
  }
  
  const D = F.calcGlobalDerived(L, W, wallHeight, data.soilCondition);
  const sections = [];

  sections.push(F.calcFootingsAndColumns2Storey(D.numCols, D.soilMultiplier));
  
  if (mezzanineLength > 0) {
    const mezzanineCols = Math.ceil(mezzanineLength / 3) + 1;
    sections.push(F.calcColumns2Storey2F(mezzanineCols, D.soilMultiplier));
  }
  
  sections.push(F.calcBeams2Storey(D.numBeams));
  sections.push(F.calcGroundSlab(D.floorArea));
  if (floor2Area > 0) {
    sections.push(F.calcUpperSlab(floor2Area));
  }
  
  sections.push(F.calcFullCHBWalls(D.wallArea));
  sections.push(F.calcRoofing(L, W, data.roofType));
  
  sections.push(F.calcBedroomsTableC(data.bedrooms || data.bedrooms1F || 0));
  sections.push(F.calcBedroomsTableD(data.bedrooms2F || 0));
  sections.push(F.calcCRsTableB(data.crs || data.bathrooms || data.crs1F || 0));
  sections.push(F.calcCRsTableB(data.crs2F || 0));
  
  sections.push(F.calcStairs());

  if (data.includePlastering) sections.push(F.calcPlastering(D.wallArea));
  if (data.includePainting) sections.push(F.calcPainting(D.wallArea));
  if (data.applyTilesGround) sections.push(F.calcTiling(D.floorArea, data.tileSize || "60x60", data.tileBreakage || 5));
  if (data.applyTilesSecond && floor2Area > 0) sections.push(F.calcTiling(floor2Area, data.tileSize || "60x60", data.tileBreakage || 5));
  if (data.hasCeiling) sections.push(F.calcCeiling(D.floorArea, L, W, data.ceilingWastage || 5));

  // Add the new MEPF and structural calculations
  sections.push(F.calcEarthworks(D.floorArea, D.totalWallLength));
  sections.push(F.calcFormworks(D.floorArea));
  
  const totalBeds = (data.bedrooms || 0) + (data.bedrooms1F || 0) + (data.bedrooms2F || 0);
  const totalCRs = (data.crs || data.bathrooms || 0) + (data.crs1F || 0) + (data.crs2F || 0);
  
  sections.push(F.calcDoorsAndWindows(totalBeds, totalCRs));
  sections.push(F.calcPlumbing(totalCRs, 1)); // Assuming 1 kitchen
  sections.push(F.calcElectrical(D.floorArea + floor2Area, totalBeds, totalCRs));

  return sumObjects(...sections);
}

import * as F from "../formulas/index.js";
import { sumObjects, validateInputs } from "../../utils/calc-helpers.js";

export function estimate(data) {
  const error = validateInputs(data, "two-storey");
  if (error) return error;

  const L = data.length || data.groundLength || 0;
  const W = data.width || data.groundWidth || 0;
  const wallHeight = data.wallHeight || data.groundWallHeight || 2.7;
  
  const secondFloorLength = data.secondFloorLength || L;
  const secondFloorWidth = data.secondFloorWidth || W;
  const secondFloorWallHeight = data.secondFloorWallHeight || 2.7;
  
  // Independent L1/W1 and L2/W2 calculations
  const D1 = F.calcGlobalDerived(L, W, wallHeight, data.soilCondition);
  const D2 = F.calcGlobalDerived(secondFloorLength, secondFloorWidth, secondFloorWallHeight, data.soilCondition);
  
  const floor2Area = D2.floorArea;
  const wall2Area = D2.wallArea;
  
  const sections = [];

  // 1F uses Heavy 2-Storey Footing + 1F Heavy Column
  sections.push(F.calcFootingsAndColumns2Storey(D1.numCols, D1.soilMultiplier));
  // 2F uses Standard Columns
  sections.push(F.calcColumns2Storey2F(D2.numCols, D2.soilMultiplier));
  
  // Combine beams for both floors
  sections.push(F.calcBeams2Storey(D1.numBeams + D2.numBeams));
  
  sections.push(F.calcGroundSlab(D1.floorArea));
  sections.push(F.calcUpperSlab(floor2Area));
  
  sections.push(F.calcFullCHBWalls(D1.wallArea));
  sections.push(F.calcFullCHBWalls(wall2Area));
  
  sections.push(F.calcRoofing(secondFloorLength, secondFloorWidth, data.roofType));
  
  sections.push(F.calcBedroomsTableC(data.bedrooms || data.bedrooms1F || 0));
  sections.push(F.calcBedroomsTableD(data.bedrooms2F || 0));
  sections.push(F.calcCRsTableB(data.crs || data.bathrooms || data.crs1F || 0));
  sections.push(F.calcCRsTableB(data.crs2F || 0));
  
  sections.push(F.calcStairs());

  if (data.includePlastering) {
    sections.push(F.calcPlastering(D1.wallArea));
    sections.push(F.calcPlastering(wall2Area));
  }
  if (data.includePainting) {
    sections.push(F.calcPainting(D1.wallArea));
    sections.push(F.calcPainting(wall2Area));
  }
  if (data.applyTilesGround) sections.push(F.calcTiling(D1.floorArea, data.tileSize || "60x60", data.tileBreakage || 5));
  if (data.applyTilesSecond) sections.push(F.calcTiling(floor2Area, data.tileSize || "60x60", data.tileBreakage || 5));
  if (data.hasCeiling) sections.push(F.calcCeiling(D1.floorArea, L, W, data.ceilingWastage || 5));
  if (data.ceilingSecondFloor) sections.push(F.calcCeiling(floor2Area, secondFloorLength, secondFloorWidth, data.ceilingWastage || 5));

  sections.push(F.calcEarthworks(D1.floorArea, D1.totalWallLength));
  sections.push(F.calcFormworks(D1.floorArea));
  const totalBeds = (data.bedrooms1F || 0) + (data.bedrooms2F || 0);
  const totalCRs = (data.crs1F || 0) + (data.crs2F || 0);
  sections.push(F.calcDoorsAndWindows(totalBeds, totalCRs));
  sections.push(F.calcPlumbing(totalCRs, 1));
  sections.push(F.calcElectrical(D1.floorArea + floor2Area, totalBeds, totalCRs));

  return sumObjects(...sections);
}

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
  
  const D = F.calcGlobalDerived(L, W, wallHeight, data.soilCondition);
  const floor2Area = secondFloorLength * secondFloorWidth;
  const wall2Area = (2 * (secondFloorLength + secondFloorWidth)) * secondFloorWallHeight;
  
  const sections = [];

  sections.push(F.calcFootingsAndColumns2Storey(D.numCols, D.soilMultiplier));
  sections.push(F.calcBeams2Storey(D.numBeams));
  sections.push(F.calcGroundSlab(D.floorArea));
  sections.push(F.calcUpperSlab(floor2Area));
  
  sections.push(F.calcFullCHBWalls(D.wallArea));
  sections.push(F.calcFullCHBWalls(wall2Area));
  
  sections.push(F.calcRoofing(secondFloorLength, secondFloorWidth, data.roofType));
  
  sections.push(F.calcBedroomsTableC(data.bedrooms || data.bedrooms1F || 0));
  sections.push(F.calcBedroomsTableD(data.bedrooms2F || 0));
  sections.push(F.calcCRsTableB(data.crs || data.bathrooms || data.crs1F || 0));
  sections.push(F.calcCRsTableB(data.crs2F || 0));
  
  sections.push(F.calcStairs());

  if (data.includePlastering) {
    sections.push(F.calcPlastering(D.wallArea));
    sections.push(F.calcPlastering(wall2Area));
  }
  if (data.includePainting) {
    sections.push(F.calcPainting(D.wallArea));
    sections.push(F.calcPainting(wall2Area));
  }
  if (data.applyTilesGround) sections.push(F.calcTiling(D.floorArea, data.tileSize || "60x60", data.tileBreakage || 5));
  if (data.applyTilesSecond) sections.push(F.calcTiling(floor2Area, data.tileSize || "60x60", data.tileBreakage || 5));
  
  if (data.hasCeiling || data.groundFloorCeiling) sections.push(F.calcCeiling(D.floorArea, L, W, data.ceilingWastage || 5));
  if (data.hasCeiling || data.ceilingSecondFloor) sections.push(F.calcCeiling(floor2Area, secondFloorLength, secondFloorWidth, data.ceilingWastage || 5));

  return sumObjects(...sections);
}

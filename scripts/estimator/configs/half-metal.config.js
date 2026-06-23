import * as F from "../formulas/index.js";
import { sumObjects, validateInputs } from "../../utils/calc-helpers.js";

export function estimate(data) {
  const error = validateInputs(data, "half-metal");
  if (error) return error;

  const L = data.length || data.groundLength || 0;
  const W = data.width || data.groundWidth || 0;
  const wallHeight = data.wallHeight || data.groundWallHeight || 2.7;
  const chbBaseWallHeight = data.chbBaseWallHeight !== undefined ? data.chbBaseWallHeight : 0.9;
  const lightWallHeight = wallHeight - chbBaseWallHeight;
  
  const D = F.calcGlobalDerived(L, W, wallHeight, data.soilCondition, true);
  const sections = [];

  sections.push(F.calcFootingsAndColumns1Storey(D.numCols, D.soilMultiplier));
  sections.push(F.calcLightweightSlab(D.floorArea));
  
  const chbBase = F.calcHalfCHBWalls(L, W, chbBaseWallHeight);
  sections.push(chbBase);
  sections.push(F.calcLightWalls(L, W, lightWallHeight, "metalCladding"));
  
  sections.push(F.calcRoofing(L, W, data.roofType, true, "metalCladding"));
  
  sections.push(F.calcBedroomsTableA(data.bedrooms || data.bedrooms1F || 0, "metalCladding"));
  sections.push(F.calcCRsTableA(data.crs || data.bathrooms || data.crs1F || 0, "metalCladding"));

  // For budget metal cladding, default to no finishes unless explicitly requested by a higher grade
  const isRaw = data.materialGrade === "Basic" || !data.materialGrade;
  if (data.includePlastering && !isRaw) sections.push(F.calcPlastering(chbBase.chbWallArea));
  if (data.includePainting && !isRaw) sections.push(F.calcPainting(chbBase.chbWallArea));
  if (data.applyTilesGround && !isRaw) sections.push(F.calcTiling(D.floorArea, data.tileSize || "60x60", data.tileBreakage || 5));
  if (data.hasCeiling && !isRaw) sections.push(F.calcCeiling(D.floorArea, L, W, data.ceilingWastage || 5));

  return sumObjects(...sections);
}

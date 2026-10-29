import * as F from "../formulas/index.js";
import { sumObjects, validateInputs } from "../../utils/calc-helpers.js";

export function estimate(data) {
  const error = validateInputs(data, "half-amakan");
  if (error) return error;

  const L = data.length || data.groundLength || 0;
  const W = data.width || data.groundWidth || 0;
  const wallHeight = data.wallHeight || data.groundWallHeight || 2.7;
  const rawBase = data.chbBaseWallHeight !== undefined ? Number(data.chbBaseWallHeight) : 0.9;
  // Guard: Base wall in half-amakan shouldn't exceed 1.2m or 50% of wall height
  const chbBaseWallHeight = Math.min(Math.max(rawBase > 0 ? rawBase : 0.9, 0.4), Math.min(1.2, wallHeight * 0.5));
  const lightWallHeight = Math.max(0, wallHeight - chbBaseWallHeight);
  
  const D = F.calcGlobalDerived(L, W, wallHeight, data.soilCondition, true);
  const sections = [];

  sections.push(F.calcFootingsAndColumns1Storey(D.numCols, D.soilMultiplier));
  sections.push(F.calcLightweightSlab(D.floorArea));
  
  // Deduct exterior entrance doorway opening at CHB base (0.9m width)
  const baseDoorDeduction = 0.9 * chbBaseWallHeight;
  const chbBase = F.calcHalfCHBWalls(L, W, chbBaseWallHeight, baseDoorDeduction);
  const chbWallArea = chbBase.chbWallArea;
  delete chbBase.chbWallArea;
  sections.push(chbBase);
  sections.push(F.calcLightWalls(L, W, lightWallHeight, "amakan"));
  
  sections.push(F.calcRoofing(L, W, data.roofType, true, "amakan"));
  
  sections.push(F.calcBedroomsTableA(data.bedrooms || data.bedrooms1F || 0, "amakan"));
  sections.push(F.calcCRsTableA(data.crs || data.bathrooms || data.crs1F || 0, "amakan"));

  // For budget amakan, default to no finishes unless explicitly requested by a higher grade
  const isRaw = data.materialGrade === "Basic" || !data.materialGrade;
  if (data.includePlastering && !isRaw) sections.push(F.calcPlastering(chbWallArea));
  if (data.includePainting && !isRaw) sections.push(F.calcPainting(chbWallArea));
  if (data.applyTilesGround) sections.push(F.calcTiling(D.floorArea, data.tileSize || "60x60", data.tileBreakage || 5));
  if (data.hasCeiling) sections.push(F.calcCeiling(D.floorArea, L, W, data.ceilingWastage || 5));

  sections.push(F.calcEarthworks(D.floorArea, D.totalWallLength));
  sections.push(F.calcFormworks(D.floorArea));
  const totalBeds = data.bedrooms || 0;
  const totalCRs = data.bathrooms || data.crs || 0;
  sections.push(F.calcDoorsAndWindows(totalBeds, totalCRs, data.materialGrade));
  if (data.includePlumbing !== false) { sections.push(F.calcPlumbing(totalCRs, 1)); }
  if (data.includeElectrical !== false) { sections.push(F.calcElectrical(D.floorArea, totalBeds, totalCRs, data.includeACwiring)); }

  return sumObjects(...sections);
}

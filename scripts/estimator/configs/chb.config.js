import * as F from "../formulas/index.js";
import { sumObjects, validateInputs } from "../../utils/calc-helpers.js";

export function estimate(data) {
  const error = validateInputs(data, "chb");
  if (error) return error;

  const L = data.length || data.groundLength || 0;
  const W = data.width || data.groundWidth || 0;
  const wallHeight = data.wallHeight || data.groundWallHeight || 2.7;
  
  const D = F.calcGlobalDerived(L, W, wallHeight, data.soilCondition);
  const sections = [];

  sections.push(F.calcFootingsAndColumns1Storey(D.numCols, D.soilMultiplier));
  sections.push(F.calcGroundSlab(D.floorArea));
  sections.push(F.calcFullCHBWalls(D.wallArea));
  sections.push(F.calcRoofing(L, W, data.roofType));
  
  sections.push(F.calcBedroomsTableB(data.bedrooms || data.bedrooms1F || 0));
  sections.push(F.calcCRsTableB(data.crs || data.bathrooms || data.crs1F || 0));

  if (data.includePlastering) sections.push(F.calcPlastering(D.wallArea));
  if (data.includePainting) sections.push(F.calcPainting(D.wallArea));
  if (data.applyTilesGround) sections.push(F.calcTiling(D.floorArea, data.tileSize || "60x60", data.tileBreakage || 5));
  if (data.hasCeiling) sections.push(F.calcCeiling(D.floorArea, L, W, data.ceilingWastage || 5));

  sections.push(F.calcEarthworks(D.floorArea, D.totalWallLength));
  sections.push(F.calcFormworks(D.floorArea));
  const totalBeds = data.bedrooms || 0;
  const totalCRs = data.bathrooms || data.crs || 0;
  sections.push(F.calcDoorsAndWindows(totalBeds, totalCRs));
  sections.push(F.calcPlumbing(totalCRs, 1));
  sections.push(F.calcElectrical(D.floorArea, totalBeds, totalCRs));

  return sumObjects(...sections);
}

import { generateEstimate } from "./scripts/estimator/aggregator.js";

const data = {
  typeKey: "half-amakan",
  length: 6,
  width: 5,
  wallHeight: 2.7,
  chbBaseWallHeight: 1.5,
  roofType: "2", // long span
  soilCondition: "medium",
  bedrooms: 2,
  bathrooms: 1,
  includePlastering: false,
  includePainting: false,
  applyTilesGround: false,
  hasCeiling: false,
  wallingMaterialType: "amakan",
  tileBreakage: 10,
  ceilingWastage: 10
};

const result = generateEstimate(data);
console.log(JSON.stringify(result, null, 2));

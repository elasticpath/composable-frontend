// This file is used to test that ESM imports work correctly
import * as PromotionsStandard from "./dist/index.mjs"

console.log("PromotionsStandard:", Object.keys(PromotionsStandard))
console.log("Test successful!")

// This file is used to test that ESM imports work correctly
import * as RulePromotions from "./dist/index.mjs"

console.log("RulePromotions:", Object.keys(RulePromotions))
console.log("Test successful!")

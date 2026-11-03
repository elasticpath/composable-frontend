// This file is used to test that ESM imports work correctly
import * as RulePromotions from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("RulePromotions:", Object.keys(RulePromotions))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

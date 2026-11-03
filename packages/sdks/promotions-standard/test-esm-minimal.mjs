// This file is used to test that ESM imports work correctly
import * as PromotionsStandard from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("PromotionsStandard:", Object.keys(PromotionsStandard))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

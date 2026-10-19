// This file is used to test that CommonJS requires work correctly
const PromotionsStandard = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("PromotionsStandard:", Object.keys(PromotionsStandard))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

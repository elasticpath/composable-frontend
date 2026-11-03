// This file is used to test that CommonJS requires work correctly
const RulePromotions = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("RulePromotions:", Object.keys(RulePromotions))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

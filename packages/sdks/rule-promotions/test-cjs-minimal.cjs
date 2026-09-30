// This file is used to test that CommonJS requires work correctly
const RulePromotions = require("./dist/index.cjs")

console.log("RulePromotions:", Object.keys(RulePromotions))
console.log("Test successful!")

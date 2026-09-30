// This file is used to test that CommonJS requires work correctly
const PromotionsStandard = require("./dist/index.cjs")

console.log("PromotionsStandard:", Object.keys(PromotionsStandard))
console.log("Test successful!")

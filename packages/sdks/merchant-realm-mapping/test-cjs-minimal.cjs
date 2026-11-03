// This file is used to test that CommonJS requires work correctly
const MerchantRealmMapping = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("MerchantRealmMapping:", Object.keys(MerchantRealmMapping))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

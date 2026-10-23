// This file is used to test that CommonJS requires work correctly
const Currencies = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Currencies:", Object.keys(Currencies))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

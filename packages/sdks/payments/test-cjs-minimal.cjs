// This file is used to test that CommonJS requires work correctly
const Payments = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Payments:", Object.keys(Payments))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

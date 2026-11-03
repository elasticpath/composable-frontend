// This file is used to test that CommonJS requires work correctly
const Inventories = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Inventories:", Object.keys(Inventories))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

// This file is used to test that CommonJS requires work correctly
const Flows = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Flows:", Object.keys(Flows))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

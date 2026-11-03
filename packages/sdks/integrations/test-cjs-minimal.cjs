// This file is used to test that CommonJS requires work correctly
const Integrations = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Integrations:", Object.keys(Integrations))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

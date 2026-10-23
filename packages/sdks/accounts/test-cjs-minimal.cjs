// This file is used to test that CommonJS requires work correctly
const Accounts = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Accounts:", Object.keys(Accounts))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

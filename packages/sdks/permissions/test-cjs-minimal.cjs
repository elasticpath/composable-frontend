// This file is used to test that CommonJS requires work correctly
const Permissions = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Permissions:", Object.keys(Permissions))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

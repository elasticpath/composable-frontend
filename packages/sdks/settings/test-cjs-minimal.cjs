// This file is used to test that CommonJS requires work correctly
const Settings = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Settings:", Object.keys(Settings))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

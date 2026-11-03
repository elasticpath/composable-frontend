// This file is used to test that CommonJS requires work correctly
const ApplicationKeys = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("ApplicationKeys:", Object.keys(ApplicationKeys))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

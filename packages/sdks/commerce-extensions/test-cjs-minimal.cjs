// This file is used to test that CommonJS requires work correctly
const CommerceExtensions = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("CommerceExtensions:", Object.keys(CommerceExtensions))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

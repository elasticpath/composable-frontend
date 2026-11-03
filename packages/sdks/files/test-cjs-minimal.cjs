// This file is used to test that CommonJS requires work correctly
const Files = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Files:", Object.keys(Files))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

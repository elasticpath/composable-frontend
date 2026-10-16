// This file is used to test that CommonJS requires work correctly
const PersonalData = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("PersonalData:", Object.keys(PersonalData))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

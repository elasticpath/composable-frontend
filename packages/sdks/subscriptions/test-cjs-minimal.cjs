// This file is used to test that CommonJS requires work correctly
const Subscriptions = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("Subscriptions:", Object.keys(Subscriptions))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

// This file is used to test that CommonJS requires work correctly
const AccountsAddresses = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("AccountsAddresses:", Object.keys(AccountsAddresses))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

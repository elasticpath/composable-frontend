// This file is used to test that CommonJS requires work correctly
const AuthenticationRealms = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("AuthenticationRealms:", Object.keys(AuthenticationRealms))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

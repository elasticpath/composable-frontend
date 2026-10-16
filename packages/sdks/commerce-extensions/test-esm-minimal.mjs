// This file is used to test that ESM imports work correctly
import * as CommerceExtensions from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("CommerceExtensions:", Object.keys(CommerceExtensions))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

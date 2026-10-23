// This file is used to test that ESM imports work correctly
import * as Settings from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Settings:", Object.keys(Settings))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

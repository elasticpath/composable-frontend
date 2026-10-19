// This file is used to test that ESM imports work correctly
import * as Inventories from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Inventories:", Object.keys(Inventories))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

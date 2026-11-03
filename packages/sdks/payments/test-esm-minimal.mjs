// This file is used to test that ESM imports work correctly
import * as Payments from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Payments:", Object.keys(Payments))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

// This file is used to test that ESM imports work correctly
import * as Currencies from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Currencies:", Object.keys(Currencies))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

// This file is used to test that ESM imports work correctly
import * as Flows from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Flows:", Object.keys(Flows))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

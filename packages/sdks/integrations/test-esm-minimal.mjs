// This file is used to test that ESM imports work correctly
import * as Integrations from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Integrations:", Object.keys(Integrations))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

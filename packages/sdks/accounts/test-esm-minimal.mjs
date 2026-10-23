// This file is used to test that ESM imports work correctly
import * as Accounts from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Accounts:", Object.keys(Accounts))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

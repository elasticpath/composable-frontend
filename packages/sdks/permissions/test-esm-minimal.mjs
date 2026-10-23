// This file is used to test that ESM imports work correctly
import * as Permissions from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Permissions:", Object.keys(Permissions))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

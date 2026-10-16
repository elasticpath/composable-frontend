// This file is used to test that ESM imports work correctly
import * as Files from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Files:", Object.keys(Files))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

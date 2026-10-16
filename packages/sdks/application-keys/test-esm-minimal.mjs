// This file is used to test that ESM imports work correctly
import * as ApplicationKeys from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("ApplicationKeys:", Object.keys(ApplicationKeys))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

// This file is used to test that ESM imports work correctly
import * as PersonalData from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("PersonalData:", Object.keys(PersonalData))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

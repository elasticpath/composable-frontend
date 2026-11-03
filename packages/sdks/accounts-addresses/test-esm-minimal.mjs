// This file is used to test that ESM imports work correctly
import * as AccountsAddresses from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("AccountsAddresses:", Object.keys(AccountsAddresses))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

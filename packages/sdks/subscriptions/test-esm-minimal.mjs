// This file is used to test that ESM imports work correctly
import * as Subscriptions from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("Subscriptions:", Object.keys(Subscriptions))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

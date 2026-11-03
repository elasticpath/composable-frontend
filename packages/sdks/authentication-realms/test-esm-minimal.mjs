// This file is used to test that ESM imports work correctly
import * as AuthenticationRealms from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("AuthenticationRealms:", Object.keys(AuthenticationRealms))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

// This file is used to test that ESM imports work correctly
import * as CartCheckoutOrder from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("CartCheckoutOrder:", Object.keys(CartCheckoutOrder))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

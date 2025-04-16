// This file is used to test that ESM imports work correctly
import * as CartCheckoutOrder from "./dist/index.mjs"

console.log("CartCheckoutOrder:", Object.keys(CartCheckoutOrder))
console.log("Test successful!")

// This file is used to test that ESM imports work correctly
import * as CommerceExtensions from "./dist/index.mjs"

console.log("CommerceExtensions:", Object.keys(CommerceExtensions))
console.log("Test successful!")

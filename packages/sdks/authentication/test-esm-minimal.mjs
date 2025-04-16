// This file is used to test that ESM imports work correctly
import * as Authentication from "./dist/index.mjs"

console.log("Authentication:", Object.keys(Authentication))
console.log("Test successful!")

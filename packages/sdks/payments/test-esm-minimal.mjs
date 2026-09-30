// This file is used to test that ESM imports work correctly
import * as Payments from "./dist/index.mjs"

console.log("Payments:", Object.keys(Payments))
console.log("Test successful!")

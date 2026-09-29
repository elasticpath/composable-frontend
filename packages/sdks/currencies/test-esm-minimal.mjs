// This file is used to test that ESM imports work correctly
import * as Currencies from "./dist/index.mjs"

console.log("Currencies:", Object.keys(Currencies))
console.log("Test successful!")

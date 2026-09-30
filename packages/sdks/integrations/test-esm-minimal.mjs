// This file is used to test that ESM imports work correctly
import * as Integrations from "./dist/index.mjs"

console.log("Integrations:", Object.keys(Integrations))
console.log("Test successful!")

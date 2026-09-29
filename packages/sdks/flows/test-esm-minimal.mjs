// This file is used to test that ESM imports work correctly
import * as Flows from "./dist/index.mjs"

console.log("Flows:", Object.keys(Flows))
console.log("Test successful!")

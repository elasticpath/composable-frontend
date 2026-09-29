// This file is used to test that ESM imports work correctly
import * as Inventories from "./dist/index.mjs"

console.log("Inventories:", Object.keys(Inventories))
console.log("Test successful!")

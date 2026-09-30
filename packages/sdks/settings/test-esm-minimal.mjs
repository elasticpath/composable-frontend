// This file is used to test that ESM imports work correctly
import * as Settings from "./dist/index.mjs"

console.log("Settings:", Object.keys(Settings))
console.log("Test successful!")

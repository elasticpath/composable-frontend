// This file is used to test that ESM imports work correctly
import * as ApplicationKeys from "./dist/index.mjs"

console.log("ApplicationKeys:", Object.keys(ApplicationKeys))
console.log("Test successful!")

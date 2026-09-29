// This file is used to test that ESM imports work correctly
import * as PersonalData from "./dist/index.mjs"

console.log("PersonalData:", Object.keys(PersonalData))
console.log("Test successful!")

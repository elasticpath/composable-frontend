// This file is used to test that ESM imports work correctly
import * as Permissions from "./dist/index.mjs"

console.log("Permissions:", Object.keys(Permissions))
console.log("Test successful!")

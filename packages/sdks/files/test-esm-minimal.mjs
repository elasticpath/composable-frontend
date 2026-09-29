// This file is used to test that ESM imports work correctly
import * as Files from "./dist/index.mjs"

console.log("Files:", Object.keys(Files))
console.log("Test successful!")

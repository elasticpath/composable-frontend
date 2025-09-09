// This file is used to test that ESM imports work correctly
import * as Accounts from "./dist/index.mjs"

console.log("Catalog search instantsearch adapter:", Object.keys(Accounts))
console.log("Test successful!")

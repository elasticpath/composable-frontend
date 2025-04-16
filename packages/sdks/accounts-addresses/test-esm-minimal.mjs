// This file is used to test that ESM imports work correctly
import * as AccountsAddresses from "./dist/index.mjs"

console.log("AccountsAddresses:", Object.keys(AccountsAddresses))
console.log("Test successful!")

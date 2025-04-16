// This file is used to test that CommonJS requires work correctly
const AccountsAddresses = require("./dist/index.cjs")

console.log("AccountsAddresses:", Object.keys(AccountsAddresses))
console.log("Test successful!")

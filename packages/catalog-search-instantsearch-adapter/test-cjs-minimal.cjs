// This file is used to test that CommonJS requires work correctly
const Accounts = require("./dist/index.cjs")

console.log("Catalog search instantsearch adapter:", Object.keys(Accounts))
console.log("Test successful!")

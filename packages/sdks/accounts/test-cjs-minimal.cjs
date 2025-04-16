// This file is used to test that CommonJS requires work correctly
const Accounts = require("./dist/index.cjs")

console.log("Accounts:", Object.keys(Accounts))
console.log("Test successful!")

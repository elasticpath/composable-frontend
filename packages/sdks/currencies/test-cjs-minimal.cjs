// This file is used to test that CommonJS requires work correctly
const Currencies = require("./dist/index.cjs")

console.log("Currencies:", Object.keys(Currencies))
console.log("Test successful!")

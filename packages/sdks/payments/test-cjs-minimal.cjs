// This file is used to test that CommonJS requires work correctly
const Payments = require("./dist/index.cjs")

console.log("Payments:", Object.keys(Payments))
console.log("Test successful!")

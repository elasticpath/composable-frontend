// This file is used to test that CommonJS requires work correctly
const Authentication = require("./dist/index.cjs")

console.log("Authentication:", Object.keys(Authentication))
console.log("Test successful!")

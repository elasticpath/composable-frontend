// This file is used to test that CommonJS requires work correctly
const Permissions = require("./dist/index.cjs")

console.log("Permissions:", Object.keys(Permissions))
console.log("Test successful!")

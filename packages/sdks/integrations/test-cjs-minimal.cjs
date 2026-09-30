// This file is used to test that CommonJS requires work correctly
const Integrations = require("./dist/index.cjs")

console.log("Integrations:", Object.keys(Integrations))
console.log("Test successful!")

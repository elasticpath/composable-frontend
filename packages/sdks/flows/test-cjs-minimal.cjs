// This file is used to test that CommonJS requires work correctly
const Flows = require("./dist/index.cjs")

console.log("Flows:", Object.keys(Flows))
console.log("Test successful!")

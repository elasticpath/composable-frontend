// This file is used to test that CommonJS requires work correctly
const Inventories = require("./dist/index.cjs")

console.log("Inventories:", Object.keys(Inventories))
console.log("Test successful!")

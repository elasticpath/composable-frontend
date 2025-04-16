// This file is used to test that CommonJS requires work correctly
const ApplicationKeys = require("./dist/index.cjs")

console.log("ApplicationKeys:", Object.keys(ApplicationKeys))
console.log("Test successful!")

// This file is used to test that CommonJS requires work correctly
const Files = require("./dist/index.cjs")

console.log("Files:", Object.keys(Files))
console.log("Test successful!")

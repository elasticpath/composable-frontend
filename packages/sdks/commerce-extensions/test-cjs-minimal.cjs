// This file is used to test that CommonJS requires work correctly
const CommerceExtensions = require("./dist/index.cjs")

console.log("CommerceExtensions:", Object.keys(CommerceExtensions))
console.log("Test successful!")

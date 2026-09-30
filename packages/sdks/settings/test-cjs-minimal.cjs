// This file is used to test that CommonJS requires work correctly
const Settings = require("./dist/index.cjs")

console.log("Settings:", Object.keys(Settings))
console.log("Test successful!")

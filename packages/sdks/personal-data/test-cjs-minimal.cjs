// This file is used to test that CommonJS requires work correctly
const PersonalData = require("./dist/index.cjs")

console.log("PersonalData:", Object.keys(PersonalData))
console.log("Test successful!")

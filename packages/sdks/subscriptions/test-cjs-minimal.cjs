// This file is used to test that CommonJS requires work correctly
const Subscriptions = require("./dist/index.cjs")

console.log("Subscriptions:", Object.keys(Subscriptions))
console.log("Test successful!")

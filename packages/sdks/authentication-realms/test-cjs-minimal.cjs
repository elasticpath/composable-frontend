// This file is used to test that CommonJS requires work correctly
const AuthenticationRealms = require("./dist/index.cjs")

console.log("AuthenticationRealms:", Object.keys(AuthenticationRealms))
console.log("Test successful!")

// This file is used to test that CommonJS requires work correctly
const MerchantRealmMapping = require("./dist/index.cjs")

console.log("MerchantRealmMapping:", Object.keys(MerchantRealmMapping))
console.log("Test successful!")

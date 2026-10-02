// This file is used to test that CommonJS requires work correctly
const CatalogSearch = require("./dist/index.cjs")

console.log("CatalogSearch:", Object.keys(CatalogSearch))
console.log("Test successful!")

// This file is used to test that CommonJS requires work correctly
const CatalogSearch = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("CatalogSearch:", Object.keys(CatalogSearch))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

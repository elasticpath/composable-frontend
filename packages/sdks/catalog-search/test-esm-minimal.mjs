// This file is used to test that ESM imports work correctly
import * as CatalogSearch from "./dist/index.mjs"

console.log("CatalogSearch:", Object.keys(CatalogSearch))
console.log("Test successful!")

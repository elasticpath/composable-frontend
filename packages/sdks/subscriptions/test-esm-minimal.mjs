// This file is used to test that ESM imports work correctly
import * as Subscriptions from "./dist/index.mjs"

console.log("Subscriptions:", Object.keys(Subscriptions))
console.log("Test successful!")

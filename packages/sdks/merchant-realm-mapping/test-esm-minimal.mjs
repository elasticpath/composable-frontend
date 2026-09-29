// This file is used to test that ESM imports work correctly
import * as MerchantRealmMapping from "./dist/index.mjs"

console.log("MerchantRealmMapping:", Object.keys(MerchantRealmMapping))
console.log("Test successful!")

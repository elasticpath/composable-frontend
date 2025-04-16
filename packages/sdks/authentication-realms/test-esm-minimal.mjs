// This file is used to test that ESM imports work correctly
import * as AuthenticationRealms from "./dist/index.mjs"

console.log("AuthenticationRealms:", Object.keys(AuthenticationRealms))
console.log("Test successful!")

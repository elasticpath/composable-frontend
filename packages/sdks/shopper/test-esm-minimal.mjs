// Minimal ESM test script
import { createClient } from "./dist/index.mjs"

console.log("ESM Import test:")
console.log(
  "- createClient imported successfully:",
  typeof createClient === "function",
)

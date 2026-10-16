// Minimal ESM test script
import { createClient } from "./dist/index.mjs"
import * as mcp from "./dist/mcp.mjs"

console.log("ESM Import test:")
console.log(
  "- createClient imported successfully:",
  typeof createClient === "function",
)
console.log("- mcp tools imported successfully:", typeof mcp.tools === "function")

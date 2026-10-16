// Minimal CommonJS test script
const { createClient } = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("CommonJS Import test:")
console.log(
  "- createClient imported successfully:",
  typeof createClient === "function",
)
console.log("- mcp tools imported successfully:", typeof mcp.tools === "function")

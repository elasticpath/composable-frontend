// Minimal CommonJS test script
const { createClient } = require("./dist/index.cjs")

console.log("CommonJS Import test:")
console.log(
  "- createClient imported successfully:",
  typeof createClient === "function",
)

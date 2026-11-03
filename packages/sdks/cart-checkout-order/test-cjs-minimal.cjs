// This file is used to test that CommonJS requires work correctly
const CartCheckoutOrder = require("./dist/index.cjs")
const mcp = require("./dist/mcp.cjs")

console.log("CartCheckoutOrder:", Object.keys(CartCheckoutOrder))
console.log("mcp:", Object.keys(mcp))
console.log("Test successful!")

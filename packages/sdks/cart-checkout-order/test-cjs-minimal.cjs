// This file is used to test that CommonJS requires work correctly
const CartCheckoutOrder = require("./dist/index.cjs")

console.log("CartCheckoutOrder:", Object.keys(CartCheckoutOrder))
console.log("Test successful!")

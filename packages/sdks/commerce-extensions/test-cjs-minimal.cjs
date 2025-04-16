// This file is used to test that CommonJS requires work correctly
const ucommerceextensions = require('./dist/index.cjs');

console.log('ucommerceextensions:', Object.keys(ucommerceextensions));
console.log('Test successful!');

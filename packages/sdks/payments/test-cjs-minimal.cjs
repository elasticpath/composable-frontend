// This file is used to test that CommonJS requires work correctly
const upayments = require('./dist/index.cjs');

console.log('upayments:', Object.keys(upayments));
console.log('Test successful!');

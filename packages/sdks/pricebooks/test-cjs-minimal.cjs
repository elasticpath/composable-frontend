// This file is used to test that CommonJS requires work correctly
const upricebooks = require('./dist/index.cjs');

console.log('upricebooks:', Object.keys(upricebooks));
console.log('Test successful!');

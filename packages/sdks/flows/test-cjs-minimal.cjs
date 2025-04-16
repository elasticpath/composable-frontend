// This file is used to test that CommonJS requires work correctly
const uflows = require('./dist/index.cjs');

console.log('uflows:', Object.keys(uflows));
console.log('Test successful!');

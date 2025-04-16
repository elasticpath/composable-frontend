// This file is used to test that CommonJS requires work correctly
const ucurrencies = require('./dist/index.cjs');

console.log('ucurrencies:', Object.keys(ucurrencies));
console.log('Test successful!');

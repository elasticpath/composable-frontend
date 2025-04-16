// This file is used to test that CommonJS requires work correctly
const upim = require('./dist/index.cjs');

console.log('upim:', Object.keys(upim));
console.log('Test successful!');

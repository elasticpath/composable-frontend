// This file is used to test that CommonJS requires work correctly
const usubscriptions = require('./dist/index.cjs');

console.log('usubscriptions:', Object.keys(usubscriptions));
console.log('Test successful!');

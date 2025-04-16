// This file is used to test that CommonJS requires work correctly
const uinventories = require('./dist/index.cjs');

console.log('uinventories:', Object.keys(uinventories));
console.log('Test successful!');

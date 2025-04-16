// This file is used to test that CommonJS requires work correctly
const uintegrations = require('./dist/index.cjs');

console.log('uintegrations:', Object.keys(uintegrations));
console.log('Test successful!');

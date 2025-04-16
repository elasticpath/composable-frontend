// This file is used to test that CommonJS requires work correctly
const ufiles = require('./dist/index.cjs');

console.log('ufiles:', Object.keys(ufiles));
console.log('Test successful!');

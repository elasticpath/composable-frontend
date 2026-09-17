// This file is used to test that CommonJS requires work correctly
const auth = require('./dist/index.cjs');

console.log('auth:', Object.keys(auth));
console.log('Test successful!');

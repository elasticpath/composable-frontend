// This file is used to test that CommonJS requires work correctly
const unextjs = require('./dist/index.cjs');

console.log('unextjs:', Object.keys(unextjs));
console.log('Test successful!');

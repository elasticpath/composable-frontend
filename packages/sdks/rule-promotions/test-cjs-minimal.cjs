// This file is used to test that CommonJS requires work correctly
const urulepromotions = require('./dist/index.cjs');

console.log('urulepromotions:', Object.keys(urulepromotions));
console.log('Test successful!');

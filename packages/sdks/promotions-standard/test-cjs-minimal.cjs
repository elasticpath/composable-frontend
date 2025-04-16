// This file is used to test that CommonJS requires work correctly
const upromotionsstandard = require('./dist/index.cjs');

console.log('upromotionsstandard:', Object.keys(upromotionsstandard));
console.log('Test successful!');

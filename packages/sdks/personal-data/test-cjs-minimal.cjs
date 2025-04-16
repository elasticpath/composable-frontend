// This file is used to test that CommonJS requires work correctly
const upersonaldata = require('./dist/index.cjs');

console.log('upersonaldata:', Object.keys(upersonaldata));
console.log('Test successful!');

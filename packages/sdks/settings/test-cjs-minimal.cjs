// This file is used to test that CommonJS requires work correctly
const usettings = require('./dist/index.cjs');

console.log('usettings:', Object.keys(usettings));
console.log('Test successful!');

// This file is used to test that CommonJS requires work correctly
const upermissions = require('./dist/index.cjs');

console.log('upermissions:', Object.keys(upermissions));
console.log('Test successful!');

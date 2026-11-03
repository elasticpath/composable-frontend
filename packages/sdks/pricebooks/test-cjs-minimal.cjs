// This file is used to test that CommonJS requires work correctly
const upricebooks = require('./dist/index.cjs');
const mcp = require('./dist/mcp.cjs');

console.log('upricebooks:', Object.keys(upricebooks));
console.log('mcp:', Object.keys(mcp));
console.log('Test successful!');

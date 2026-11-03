// This file is used to test that CommonJS requires work correctly
const upim = require('./dist/index.cjs');
const mcp = require('./dist/mcp.cjs');

console.log('upim:', Object.keys(upim));
console.log('mcp:', Object.keys(mcp));
console.log('Test successful!');

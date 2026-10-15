const ucatalogs = require('./dist/index.cjs');
const mcp = require('./dist/mcp.cjs');

console.log('ucatalogs:', Object.keys(ucatalogs));
console.log('mcp:', Object.keys(mcp), mcp.operations.length, 'operations');
console.log('Test successful!');

import * as ucatalogs from './dist/index.mjs';
import * as mcp from './dist/mcp.mjs';

console.log('ucatalogs:', Object.keys(ucatalogs));
console.log('mcp:', Object.keys(mcp), mcp.operations.length, 'operations');
console.log('Test successful!');

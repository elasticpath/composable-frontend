// This file is used to test that ESM imports work correctly
import * as upricebooks from './dist/index.mjs';
import * as mcp from './dist/mcp.mjs';

console.log('upricebooks:', Object.keys(upricebooks));
console.log('mcp:', Object.keys(mcp));
console.log('Test successful!');

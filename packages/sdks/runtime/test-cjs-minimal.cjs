// This file is used to test that CommonJS requires work correctly, at the root
// and at every subpath the exports map declares.
const runtime = require('@epcc-sdk/sdks-runtime');
const retry = require('@epcc-sdk/sdks-runtime/retry');
const mcp = require('@epcc-sdk/sdks-runtime/mcp');

console.log('runtime:', Object.keys(runtime));
console.log('retry:', Object.keys(retry));
console.log('mcp:', Object.keys(mcp));
console.log('Test successful!');

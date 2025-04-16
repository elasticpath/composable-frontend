// This file is used to test that ESM imports work correctly
import * as upayments from './dist/index.mjs';

console.log('upayments:', Object.keys(upayments));
console.log('Test successful!');

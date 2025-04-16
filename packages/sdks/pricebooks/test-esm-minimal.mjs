// This file is used to test that ESM imports work correctly
import * as upricebooks from './dist/index.mjs';

console.log('upricebooks:', Object.keys(upricebooks));
console.log('Test successful!');

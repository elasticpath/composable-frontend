// This file is used to test that ESM imports work correctly
import * as upim from './dist/index.mjs';

console.log('upim:', Object.keys(upim));
console.log('Test successful!');

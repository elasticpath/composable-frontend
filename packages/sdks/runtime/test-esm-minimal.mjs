// This file is used to test that ESM imports work correctly
import * as auth from './dist/index.mjs';

console.log('auth:', Object.keys(auth));
console.log('Test successful!');

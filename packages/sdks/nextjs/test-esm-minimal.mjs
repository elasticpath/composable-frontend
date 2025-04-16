// This file is used to test that ESM imports work correctly
import * as unextjs from './dist/index.mjs';

console.log('unextjs:', Object.keys(unextjs));
console.log('Test successful!');

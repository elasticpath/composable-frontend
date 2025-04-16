// This file is used to test that ESM imports work correctly
import * as ufiles from './dist/index.mjs';

console.log('ufiles:', Object.keys(ufiles));
console.log('Test successful!');

// This file is used to test that ESM imports work correctly
import * as usubscriptions from './dist/index.mjs';

console.log('usubscriptions:', Object.keys(usubscriptions));
console.log('Test successful!');

// This file is used to test that ESM imports work correctly
import * as upersonaldata from './dist/index.mjs';

console.log('upersonaldata:', Object.keys(upersonaldata));
console.log('Test successful!');

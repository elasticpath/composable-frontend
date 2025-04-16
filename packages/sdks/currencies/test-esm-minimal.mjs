// This file is used to test that ESM imports work correctly
import * as ucurrencies from './dist/index.mjs';

console.log('ucurrencies:', Object.keys(ucurrencies));
console.log('Test successful!');

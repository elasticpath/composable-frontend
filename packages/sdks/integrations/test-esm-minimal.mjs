// This file is used to test that ESM imports work correctly
import * as uintegrations from './dist/index.mjs';

console.log('uintegrations:', Object.keys(uintegrations));
console.log('Test successful!');

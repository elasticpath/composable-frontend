// This file is used to test that ESM imports work correctly
import * as uinventories from './dist/index.mjs';

console.log('uinventories:', Object.keys(uinventories));
console.log('Test successful!');

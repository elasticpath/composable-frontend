// This file is used to test that ESM imports work correctly
import * as usettings from './dist/index.mjs';

console.log('usettings:', Object.keys(usettings));
console.log('Test successful!');

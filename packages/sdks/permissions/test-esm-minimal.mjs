// This file is used to test that ESM imports work correctly
import * as upermissions from './dist/index.mjs';

console.log('upermissions:', Object.keys(upermissions));
console.log('Test successful!');

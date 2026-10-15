// This file is used to test that ESM imports work correctly, at the root and
// at every subpath the exports map declares.
import * as runtime from "@epcc-sdk/sdks-runtime"
import * as retry from "@epcc-sdk/sdks-runtime/retry"

console.log('runtime:', Object.keys(runtime));
console.log('retry:', Object.keys(retry));
console.log('Test successful!');

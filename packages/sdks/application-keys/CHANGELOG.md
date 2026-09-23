# @epcc-sdk/sdks-application-keys

## 0.1.0

### Minor Changes

- 619e3b2e: Regenerate from the upstream `application-keys` spec (spec version 26.0212.7188016, published 2026-02-12T23:38:57Z).

  Adds 35 exported symbols.

  **Breaking.** Removes 35 exported symbols:

  - `application-keys: ApplicationKeyResponse`
  - `application-keys: ErrorResponse`
  - `application-keys: _Error`
  - `application-keys: PaginationMeta`
  - `application-keys: SelfLink`
  - `application-keys: GetAllKeysData`
  - `application-keys: GetAllKeysErrors`
  - `application-keys: GetAllKeysError`
  - `application-keys: GetAllKeysResponses`
  - `application-keys: GetAllKeysResponse`
  - `application-keys: CreateKeyData`
  - `application-keys: CreateKeyErrors`
  - `application-keys: CreateKeyError`
  - `application-keys: CreateKeyResponses`
  - `application-keys: CreateKeyResponse`
  - `application-keys: DeleteKeyData`
  - `application-keys: DeleteKeyErrors`
  - `application-keys: DeleteKeyError`
  - `application-keys: DeleteKeyResponses`
  - `application-keys: DeleteKeyResponse`
  - `application-keys: GetKeyData`
  - `application-keys: GetKeyErrors`
  - `application-keys: GetKeyError`
  - `application-keys: GetKeyResponses`
  - `application-keys: GetKeyResponse`
  - `application-keys: UpdateKeyData`
  - `application-keys: UpdateKeyErrors`
  - `application-keys: UpdateKeyError`
  - `application-keys: UpdateKeyResponses`
  - `application-keys: UpdateKeyResponse`
  - `application-keys: getAllKeys`
  - `application-keys: createKey`
  - `application-keys: deleteKey`
  - `application-keys: getKey`
  - `application-keys: updateKey`

## 0.0.2

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.1

### Patch Changes

- e5fbcf1: Release missing sdks

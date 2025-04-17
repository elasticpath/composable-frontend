# @epcc-sdk/sdks-accounts-addresses

## 0.0.4

### Patch Changes

- 529d5b4: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.3

### Patch Changes

- f572a2c: add currencies to shopper

## 0.0.2

### Patch Changes

- 2c3e2ab: Make sure post requests to add address are to the correct endpoint

## 0.0.1

### Patch Changes

- 5084ff0: Add accounts addresses sdk

# @epcc-sdk/flows

## 0.1.0

### Minor Changes

- a01a07e4: Regenerate from the upstream `flows` spec (spec version 26.0630.7838720, published 2026-06-30T08:57:57Z).

  Adds 4 exported symbols.

  **Breaking.** Removes 1 exported symbol:

  - `flows: FlowsLinks`

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

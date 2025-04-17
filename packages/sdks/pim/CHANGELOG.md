# @epcc-sdk/sdks-pxm

## 0.0.6

### Patch Changes

- 529d5b4: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.5

### Patch Changes

- 5c8d75a: Update to latest pxm spec

## 0.0.4

### Patch Changes

- 1c3586d: Remove version from README

## 0.0.3

### Patch Changes

- 6324423: Add README sdks

## 0.0.2

### Patch Changes

- 0496e87: init release of next gen sdks

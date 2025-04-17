# @epcc-sdk/sdks-nextjs

## 0.0.10

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.9

### Patch Changes

- eeaa3c0: Use correct account cookie key

## 0.0.8

### Patch Changes

- 98ab640: create account middleware nextjs

## 0.0.7

### Patch Changes

- 1da007e: make the min peer dependency for nextjs sdk, next 15

## 0.0.6

### Patch Changes

- da62157: Add nextjs accounts utils

## 0.0.5

### Patch Changes

- dae717e: Export get cookie value function

## 0.0.4

### Patch Changes

- 7545ee4: support nextjs 15 interceptor

## 0.0.3

### Patch Changes

- ec5170b: add client side supporting nextjs auth interceptor

## 0.0.2

### Patch Changes

- 0496e87: init release of next gen sdks

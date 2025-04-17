# @epcc-sdk/sdks-cart-checkout-order

## 0.0.6

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.5

### Patch Changes

- 09d3a57: add missing cart properties

## 0.0.4

### Patch Changes

- 1a19c39: Add include to get an order operation
- a4adea2: add customer details to order response

## 0.0.3

### Patch Changes

- 1e94fe3: add include for cart checkout get orders

## 0.0.2

### Patch Changes

- d3d3c11: Update to match latest specs

## 0.0.1

### Patch Changes

- 0733828: add cart, checkout, order sdks

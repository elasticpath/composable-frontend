# @epcc-sdk/payments

## 0.1.0

### Minor Changes

- d5781c20: Regenerate from the upstream `payments` spec (spec version 25.1125.6251808).

  Adds 1 exported symbol.

  **Breaking.** Removes 8 exported symbols:

  - `payments: RequestUpdateStripeConnectGateway`
  - `payments: DataUpdateStripeConnectGateway`
  - `payments: UpdateStripeConnectGatewayData`
  - `payments: UpdateStripeConnectGatewayErrors`
  - `payments: UpdateStripeConnectGatewayError`
  - `payments: UpdateStripeConnectGatewayResponses`
  - `payments: UpdateStripeConnectGatewayResponse`
  - `payments: updateStripeConnectGateway`

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

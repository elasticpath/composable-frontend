# @epcc-sdk/settings

## 0.1.0

### Minor Changes

- dac4416a: Regenerate from the upstream `settings` spec (spec version 26.0224.7243587, published 2026-02-24T23:34:24Z).

  **Breaking.** Removes 13 exported symbols:

  - `settings: SettingsCart`
  - `settings: GetV2SettingsCartData`
  - `settings: GetV2SettingsCartErrors`
  - `settings: GetV2SettingsCartError`
  - `settings: GetV2SettingsCartResponses`
  - `settings: GetV2SettingsCartResponse`
  - `settings: PutV2SettingsCartData`
  - `settings: PutV2SettingsCartErrors`
  - `settings: PutV2SettingsCartError`
  - `settings: PutV2SettingsCartResponses`
  - `settings: PutV2SettingsCartResponse`
  - `settings: getV2SettingsCart`
  - `settings: putV2SettingsCart`

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

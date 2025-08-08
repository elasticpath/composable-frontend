# @epcc-sdk/sdks-subscriptions

## 0.0.5

### Patch Changes

- 52f74dc: Breaking: Update subscriptions SDK to new API architecture

  - **Breaking**: Removed Products and Plans as standalone entities - they must now be created within offerings
  - **Breaking**: Removed `/subscriptions/products` and `/subscriptions/plans` endpoints
  - **New**: Introduced Pricing Options for billing rules (replacing standalone Plans)
  - **New**: Plans are created directly in offerings via new simplified workflow
  - Simplified from 3-step process (products→plans→offerings) to 1-step (offerings with embedded plans)

## 0.0.4

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.3

### Patch Changes

- 1c3586d: Remove version from README

## 0.0.2

### Patch Changes

- 6324423: Add README sdks

## 0.0.1

### Patch Changes

- bd1e928: Add subscriptions gen 2 sdk

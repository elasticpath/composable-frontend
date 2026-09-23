# @epcc-sdk/permissions

## 0.1.0

### Minor Changes

- d2ca6541: Regenerate from the upstream `permissions` spec (spec version 26.0610.7728570, published 2026-06-10T00:02:14Z).

  Adds 58 exported symbols.

  **Breaking.** Removes 19 exported symbols:

  - `permissions: BuiltInRoleAttributes`
  - `permissions: BuiltInRoleSelfLink`
  - `permissions: CustomApiRolePolicyAttributes`
  - `permissions: CustomApiRolePolicySelfLink`
  - `permissions: ErrorResponse`
  - `permissions: _Error`
  - `permissions: BuiltInRoleId`
  - `permissions: ListBuiltInRolesData`
  - `permissions: ListBuiltInRolesErrors`
  - `permissions: ListBuiltInRolesError`
  - `permissions: ListBuiltInRolesResponses`
  - `permissions: ListBuiltInRolesResponse`
  - `permissions: GetABuiltInRoleData`
  - `permissions: GetABuiltInRoleErrors`
  - `permissions: GetABuiltInRoleError`
  - `permissions: GetABuiltInRoleResponses`
  - `permissions: GetABuiltInRoleResponse`
  - `permissions: listBuiltInRoles`
  - `permissions: getABuiltInRole`

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

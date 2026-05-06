# @epcc-sdk/sdks-pxm

## 0.1.0

### Minor Changes

- a363b78d: Add support for shopper and admin attributes, bundle quantity configuration, and selective column export on products.

  - New `ShopperAttributes` and `AdminAttributes` types (string→string maps, max 100 keys) on products, hierarchies and nodes. `shopper_attributes` are catalog-visible; `admin_attributes` are admin-only.
  - Product list/export endpoints now accept filters using `eq(shopper_attributes.<key>,…)` and `eq(admin_attributes.<key>,…)`.
  - Product import (CSV) supports `shopper_attributes.<key>` / `admin_attributes.<key>` columns, partial updates, and the `__REMOVE_ATTRIBUTE__` sentinel for deleting a key.
  - Product export request body supports `data.attributes.columns.include` to cherry-pick exported columns (including wildcards like `admin_attributes.*`).
  - Bundle component options now expose per-option `min` / `max` to configure shopper-selectable quantities.
  - Multi-product responses now include a `links` object (typed via the new `multi_links` schema).

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

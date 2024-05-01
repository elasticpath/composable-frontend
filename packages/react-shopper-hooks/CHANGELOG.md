# @elasticpath/react-shopper-hooks

## 0.10.0

### Minor Changes

- 091eebd: - adds a hook that gives back the main image and other files associated with the products returned

## 0.9.0

### Minor Changes

- e8f102e: - add product list example
  - add product now takes optional params
  - remove params for use delete cart query
  - allow select query function
  - make add product include params dynamic
- f890d84: Bump and fix moltin sdk dependency
- f890d84: Bump moltin version and fix it

### Patch Changes

- Updated dependencies [f890d84]
- Updated dependencies [f890d84]
  - @elasticpath/shopper-common@0.3.0

## 0.8.0

### Minor Changes

- ce04040: - Moved scoped hooks outside cart provider
  - Added default cart id to cart provider using the sdks cart id
  - Added useProducts hook

## 0.7.2

### Patch Changes

- 85eb224: Use fixed version workspace syntax

## 0.7.1

### Patch Changes

- 48160ba: Bumped moltin/sdk version
- Updated dependencies [48160ba]
  - @elasticpath/shopper-common@0.2.2

## 0.7.0

### Minor Changes

- 5f0df93: New interface for useCart
- 3355c74: Added a top level ElasticPath provider and account query hooks, using tanstack query under the hood

## 0.6.2

### Patch Changes

- 07674b4: building with tsup and outputing a non bundled build
- f904b20: Workspace prefixes added and removed version from examples package.json

## 0.6.1

### Patch Changes

- 8797e84: bumped moltin sdk in all repos and d2c output
- Updated dependencies [8797e84]
  - @elasticpath/shopper-common@0.2.1

## 0.6.0

### Minor Changes

- 0291e71: manual payment gateway support for d2c starter kit

### Patch Changes

- Updated dependencies [0291e71]
  - @elasticpath/shopper-common@0.2.0

## 0.5.4

### Patch Changes

- Updated dependencies [a1ef9a2]
  - @elasticpath/shopper-common@0.1.3

## 0.5.3

### Patch Changes

- cd0a8db: force release to fix version issue
- Updated dependencies [cd0a8db]
  - @elasticpath/shopper-common@0.1.2

## 0.5.2

### Patch Changes

- 462cccd: bumped react types version

## 0.5.1

### Patch Changes

- 34a3be2: missing build output corrected
- Updated dependencies [34a3be2]
  - @elasticpath/shopper-common@0.1.1

## 0.5.0

### Minor Changes

- 6f21687: add navigation to shopper store context

### Patch Changes

- 6f21687: ### migrated from yarn to pnpm

  - Having issue managing the yarn workspace moved to pnpm

- Updated dependencies [6f21687]
- Updated dependencies [6f21687]
  - @elasticpath/shopper-common@0.1.0

## 0.4.0

### Minor Changes

- 19ada03: - created shopper common package for common utilities and types
  - updated react shopper hooks to use common elements from shopper common

### Patch Changes

- d640de1: use explicit versioning
- Updated dependencies [19ada03]
  - @elasticpath/shopper-common@0.0.1

## 0.3.3

### Patch Changes

- dd0a48c: - bumped moltin sdk version

## 0.3.2

### Patch Changes

- 706d89a: - Library code is no minfied
  - Fixed the resolved for other images so product images are now correctly resolved

## 0.3.1

### Patch Changes

- c67286c: Bumped to latest version of moltin sdk

## 0.3.0

### Minor Changes

- a7fba18: use store hook for handling shared client

## 0.2.4

### Patch Changes

- 29bafe1: use configure bundle from js-sdk

## 0.2.3

### Patch Changes

- f75a778: add bundle to cart added to useCart hook
- f75a778: added bundle provider and hooks
- f75a778: added hooks for bundle components and component options

## 0.2.2

### Patch Changes

- 8cdb0a8: added product component images to creator function

## 0.2.1

### Patch Changes

- 8bac418: add bundle to cart added to useCart hook
- 8bac418: added bundle provider and hooks

## 0.2.0

### Minor Changes

- 4a3b5cb: e2e test refactoring and added complete ep payment e2e checkout flow test.

## 0.1.2

### Patch Changes

- 521b6b8: Fixed build process to resolve react/jsx-runtime import issue.

## 0.1.1

### Patch Changes

- 766b65c: removed spinner because \_stripeIntent is just creating an order

## 0.1.0

### Minor Changes

- 0333227: Added stripe intent support to the cart hook

  - This is a quick fix for now and will be redesigned and a useCheckout hook created if needed support multiple payment gateways better.

## 0.0.3

### Patch Changes

- b726ea5: Changed missed package name values from epcc-react to react-shopper-hooks

## 0.0.2

### Patch Changes

- 4d6bfa4: Renamed the package to publish to elasticpath scope on npm.

## 0.0.1

### Patch Changes

- 3b8b278: Added react-shopper-hooks for custom d2c hooks and other react helpers. Added a product detail page schematic.

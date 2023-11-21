# @elasticpath/d2c-schematics

## 0.12.1

### Patch Changes

- 2636765: Using latest hooks

## 0.12.0

### Minor Changes

- 061bbfe: Added simple plp that uses Elastic Path directly and no third party dependencies

### Patch Changes

- f904b20: Workspace prefixes added and removed version from examples package.json
- Updated dependencies [f904b20]
  - @elasticpath/composable-integration-hub-deployer@0.3.1

## 0.11.1

### Patch Changes

- 8797e84: bumped moltin sdk in all repos and d2c output
- 8797e84: bumped hooks and common dep version
- c1d0fd1: e2e test fixed for checkout manual flow
- Updated dependencies [8797e84]
  - @elasticpath/composable-common@0.3.1

## 0.11.0

### Minor Changes

- 0291e71: manual payment gateway support for d2c starter kit

### Patch Changes

- Updated dependencies [0291e71]
  - @elasticpath/composable-common@0.3.0
  - @elasticpath/composable-integration-hub-deployer@0.3.0

## 0.10.5

### Patch Changes

- b327b4d: updated readme to be more reflective of the current state of the d2c output

## 0.10.4

### Patch Changes

- e15e76f: readme now uses projec name

## 0.10.3

### Patch Changes

- Updated dependencies [a1ef9a2]
  - @elasticpath/composable-common@0.2.7
  - @elasticpath/composable-integration-hub-deployer@0.2.6

## 0.10.2

### Patch Changes

- bb05c3e: bumped devkit to support node 18
- Updated dependencies [bb05c3e]
  - @elasticpath/composable-common@0.2.6
  - @elasticpath/composable-integration-hub-deployer@0.2.5

## 0.10.1

### Patch Changes

- cd0a8db: force release to fix version issue
- Updated dependencies [cd0a8db]
  - @elasticpath/composable-common@0.2.5
  - @elasticpath/composable-integration-hub-deployer@0.2.4

## 0.10.0

### Minor Changes

- 462cccd: Migrated D2C starter kit to Next.js 13 App directory routing

### Patch Changes

- 462cccd: bumped react types version
- e1f97c9: lock version of react shopper hooks inside d2c output

## 0.9.3

### Patch Changes

- Updated dependencies [34a3be2]
  - @elasticpath/composable-common@0.2.4
  - @elasticpath/composable-integration-hub-deployer@0.2.3

## 0.9.2

### Patch Changes

- 6f21687: ### migrated from yarn to pnpm

  - Having issue managing the yarn workspace moved to pnpm

- Updated dependencies [6f21687]
  - @elasticpath/composable-integration-hub-deployer@0.2.2
  - @elasticpath/composable-common@0.2.3

## 0.9.1

### Patch Changes

- d640de1: use explicit versioning
- 2fdb8aa: removed yup and using zod instead
- 19ada03: import was using local path
- Updated dependencies [d640de1]
  - @elasticpath/composable-integration-hub-deployer@0.2.1

## 0.9.0

### Minor Changes

- dd0a48c: - Added bundles support to d2c output
  - Refactored product components to use the latest react shopper hooks

### Patch Changes

- dd0a48c: - bumped moltin sdk version
- Updated dependencies [dd0a48c]
  - @elasticpath/composable-common@0.2.2

## 0.8.3

### Patch Changes

- c8f1cd0: improved error handling and workspace composablerc template fix

## 0.8.2

### Patch Changes

- 7c5f29e: Added .composablerc file for storing project specific configuration

## 0.8.1

### Patch Changes

- 5782376: Fix for search modal result links
- e143bbb: d2c generate command is now using the new ep payments ep-payments command for gateway setup

## 0.8.0

### Minor Changes

- 85c20dc: CLI user can now execute the command `ep int algolia` to run the Algolia integration setup.

  - Checks if the active store has the Aloglia integration already
  - Creates and depolys the integration for the user for the active store
  - Prompts the user if they want to publish a catalog after the integration is configured as it's needed to start indexing
  - Waits for that new index to appear in Algolia and then applies additional confuration for facets and replicas

  This command is also used post `ep generate d2c` if the user selected the Algolia integration they are given a prompt to ask if they want to configure it now.

### Patch Changes

- Updated dependencies [85c20dc]
  - @elasticpath/composable-integration-hub-deployer@0.2.0
  - @elasticpath/composable-common@0.2.0

## 0.7.3

### Patch Changes

- 4961378: package json template file typo

## 0.7.2

### Patch Changes

- fffc0d6: update vitest to fix npm install

## 0.7.1

### Patch Changes

- 7c78031: fixed prettier formatting
- e69e421: Updated logos and styles to match Elastic Path rebrand.

## 0.7.0

### Minor Changes

- c67286c: ## Tailwind CSS based d2c starter

  We have moved away from chakra ui and are now using tailwind css to style the d2c starter kit.

  This is just a first step improved styling to follow.

### Patch Changes

- c67286c: Detecting user package manager for them
- c67286c: Bumped to latest version of moltin sdk
- Updated dependencies [c67286c]
  - @elasticpath/composable-common@0.1.6

## 0.6.4

### Patch Changes

- d0fadcb: home page featured products components that pulls from all products in catalog
- d0fadcb: Error message handling for no catalog for epcc store
- d0fadcb: home creates the featured products now by default
- d0fadcb: Added mock pages for shipping, FAQ, terms and about us
- d0fadcb: us-east image location added to next config to allow images from that domain by default

## 0.6.3

### Patch Changes

- 333d5a0: change to composable cli package from elasticpath npm scope to a root scoped package

## 0.6.2

### Patch Changes

- 97c9a9d: Renamed mason packages and repository to composable and composable-cli to match the new naming convention.
- Updated dependencies [97c9a9d]
  - @elasticpath/composable-integration-hub-deployer@0.1.5
  - @elasticpath/composable-common@0.1.5

## 0.6.1

### Patch Changes

- d5204dd: If algolia instance already exists in the integration hub for the users store then setup is considered a success.
- 7280315: Removed Manual option for payment gateway as it's not yet supported

## 0.6.0

### Minor Changes

- 4a3b5cb: e2e test refactoring and added complete ep payment e2e checkout flow test.

### Patch Changes

- Updated dependencies [4a3b5cb]
  - @elasticpath/mason-common@0.1.4
  - @elasticpath/mason-integration-hub-deployer@0.1.4

## 0.5.4

### Patch Changes

- 37c3114: warn user of unsupported product extensions and don't attempt to render them
- 008b51b: Use ISR for product pages and fetch no product pages up front.

## 0.5.3

### Patch Changes

- Updated dependencies [0d49ff9]
  - @elasticpath/mason-integration-hub-deployer@0.1.3
  - @elasticpath/mason-common@0.1.3

## 0.5.2

### Patch Changes

- d81ac4c: Fixed multi region support
- Updated dependencies [d81ac4c]
  - @elasticpath/mason-integration-hub-deployer@0.1.2
  - @elasticpath/mason-common@0.1.2

## 0.5.1

### Patch Changes

- Updated dependencies [8c08752]
  - @elasticpath/mason-common@0.1.1
  - @elasticpath/mason-integration-hub-deployer@0.1.1

## 0.5.0

### Minor Changes

- 231a966: D2C Schematic now supports an Algolia powered Product List Page (PLP) including automatic configuration of the EPCC Integration Hub

### Patch Changes

- Updated dependencies [231a966]
  - @elasticpath/mason-integration-hub-deployer@0.1.0
  - @elasticpath/mason-common@0.1.0

## 0.4.6

### Patch Changes

- 9710671: Using the elasticpath scopped version of react-shopper-hooks

## 0.4.5

### Patch Changes

- d469a6f: Added id for regular menu

## 0.4.4

### Patch Changes

- f1f5101: Added playwright test install script before running e2e tests
- f1f5101: Don't include featured products or promotions related data when not included in build
- f1f5101: Added e2e test simple add product to cart example
- f1f5101: e2e on failure screenshots added

## 0.4.3

### Patch Changes

- eb8e07e: Changed the name and scope of schematics package.

## 0.4.2

### Patch Changes

- e7441e3: Replaced api.moltin.com with the proxy euwest.api.elasticpath.com

## 0.4.1

### Patch Changes

- b726ea5: Clean up of missed refactoring mistakes

  - Removed no longer needed components schematics
  - Moved cart component to a subfolder
  - Fixed link to cart page
  - Removed old unused style sheet

## 0.4.0

### Minor Changes

- 4d6bfa4: Created new schematics for header, footer, product-detail-page, home. Including two component schematics for featured-products and promotion-banner.

## 0.3.1

### Patch Changes

- 3b8b278: Added epcc-react package for custom d2c hooks and other react helpers. Added a product detail page schematic.

## 0.3.0

### Minor Changes

- 0f69840: Added application, cart and updated workspace schematic to support a basic first pass of the d2c starter kit.

### Patch Changes

- 0f69840: Debugging logs

## 0.2.0

### Minor Changes

- f0f3a87: Added application, cart and updated workspace schematic to support a basic first pass of the d2c starter kit.

## 0.1.0

### Minor Changes

- 0d4ea84: Moved schematics out to their own package.

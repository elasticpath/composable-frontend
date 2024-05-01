# @elasticpath/composable-common

## 0.5.0

### Minor Changes

- f890d84: Bump moltin version and fix it

## 0.4.0

### Minor Changes

- 48160ba: Fix to authenticate new intergration hub tokens using the embedded authentication endpoint

### Patch Changes

- 48160ba: Bumped moltin/sdk version

## 0.3.1

### Patch Changes

- 8797e84: bumped moltin sdk in all repos and d2c output

## 0.3.0

### Minor Changes

- 0291e71: manual payment gateway support for d2c starter kit

## 0.2.7

### Patch Changes

- a1ef9a2: fix for globing issue

## 0.2.6

### Patch Changes

- bb05c3e: bumped devkit to support node 18

## 0.2.5

### Patch Changes

- cd0a8db: force release to fix version issue

## 0.2.4

### Patch Changes

- 34a3be2: missing build output corrected

## 0.2.3

### Patch Changes

- 6f21687: ### migrated from yarn to pnpm

  - Having issue managing the yarn workspace moved to pnpm

## 0.2.2

### Patch Changes

- dd0a48c: - bumped moltin sdk version

## 0.2.1

### Patch Changes

- b79f574: changed the handling of already existing ep payments gateways

## 0.2.0

### Minor Changes

- 85c20dc: CLI user can now execute the command `ep int algolia` to run the Algolia integration setup.

  - Checks if the active store has the Aloglia integration already
  - Creates and depolys the integration for the user for the active store
  - Prompts the user if they want to publish a catalog after the integration is configured as it's needed to start indexing
  - Waits for that new index to appear in Algolia and then applies additional confuration for facets and replicas

  This command is also used post `ep generate d2c` if the user selected the Algolia integration they are given a prompt to ask if they want to configure it now.

## 0.1.6

### Patch Changes

- c67286c: Bumped to latest version of moltin sdk

## 0.1.5

### Patch Changes

- 97c9a9d: Renamed mason packages and repository to composable and composable-cli to match the new naming convention.

## 0.1.4

### Patch Changes

- 4a3b5cb: fixed tests

  - was failing due to executing specs inside node_modules, so ignoring
  - fixed tests for epcc url resolve to match intended use case

## 0.1.3

### Patch Changes

- 0d49ff9: For non eu-west/us-east based EPCC sites the correct integration id is now being resolved from given region

## 0.1.2

### Patch Changes

- d81ac4c: Fixed multi region support

## 0.1.1

### Patch Changes

- 8c08752: Dependencies for urql/core and graphql where missing, they have now been added to mason-common

## 0.1.0

### Minor Changes

- 231a966: D2C Schematic now supports an Algolia powered Product List Page (PLP) including automatic configuration of the EPCC Integration Hub

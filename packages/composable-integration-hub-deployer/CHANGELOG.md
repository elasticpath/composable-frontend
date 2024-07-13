# @elasticpath/composable-integration-hub-deployer

## 0.3.4

### Patch Changes

- Updated dependencies [f890d84]
  - @elasticpath/composable-common@0.5.0

## 0.3.3

### Patch Changes

- 85eb224: Use fixed version workspace syntax

## 0.3.2

### Patch Changes

- Updated dependencies [48160ba]
- Updated dependencies [48160ba]
  - @elasticpath/composable-common@0.4.0

## 0.3.1

### Patch Changes

- f904b20: Workspace prefixes added and removed version from examples package.json

## 0.3.0

### Minor Changes

- 0291e71: manual payment gateway support for d2c starter kit

### Patch Changes

- Updated dependencies [0291e71]
  - @elasticpath/composable-common@0.3.0

## 0.2.6

### Patch Changes

- Updated dependencies [a1ef9a2]
  - @elasticpath/composable-common@0.2.7

## 0.2.5

### Patch Changes

- Updated dependencies [bb05c3e]
  - @elasticpath/composable-common@0.2.6

## 0.2.4

### Patch Changes

- cd0a8db: force release to fix version issue
- Updated dependencies [cd0a8db]
  - @elasticpath/composable-common@0.2.5

## 0.2.3

### Patch Changes

- 34a3be2: missing build output corrected
- Updated dependencies [34a3be2]
  - @elasticpath/composable-common@0.2.4

## 0.2.2

### Patch Changes

- 6f21687: ### migrated from yarn to pnpm

  - Having issue managing the yarn workspace moved to pnpm

- Updated dependencies [6f21687]
  - @elasticpath/composable-common@0.2.3

## 0.2.1

### Patch Changes

- d640de1: use explicit versioning

## 0.2.0

### Minor Changes

- 85c20dc: CLI user can now execute the command `ep int algolia` to run the Algolia integration setup.

  - Checks if the active store has the Aloglia integration already
  - Creates and depolys the integration for the user for the active store
  - Prompts the user if they want to publish a catalog after the integration is configured as it's needed to start indexing
  - Waits for that new index to appear in Algolia and then applies additional confuration for facets and replicas

  This command is also used post `ep generate d2c` if the user selected the Algolia integration they are given a prompt to ask if they want to configure it now.

### Patch Changes

- Updated dependencies [85c20dc]
  - @elasticpath/composable-common@0.2.0

## 0.1.5

### Patch Changes

- 97c9a9d: Renamed mason packages and repository to composable and composable-cli to match the new naming convention.
- Updated dependencies [97c9a9d]
  - @elasticpath/composable-common@0.1.5

## 0.1.4

### Patch Changes

- Updated dependencies [4a3b5cb]
  - @elasticpath/mason-common@0.1.4

## 0.1.3

### Patch Changes

- 0d49ff9: For non eu-west/us-east based EPCC sites the correct integration id is now being resolved from given region
- Updated dependencies [0d49ff9]
  - @elasticpath/mason-common@0.1.3

## 0.1.2

### Patch Changes

- d81ac4c: Fixed multi region support
- Updated dependencies [d81ac4c]
  - @elasticpath/mason-common@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [8c08752]
  - @elasticpath/mason-common@0.1.1

## 0.1.0

### Minor Changes

- 231a966: D2C Schematic now supports an Algolia powered Product List Page (PLP) including automatic configuration of the EPCC Integration Hub

### Patch Changes

- Updated dependencies [231a966]
  - @elasticpath/mason-common@0.1.0

# composable-cli

## 0.8.0

### Minor Changes

- b79f574: - auto adds ep payments environment variables so the user no longer needs to add them on their own
  - changes the way authentication was handled
  - adds some additional logging and error handling

### Patch Changes

- b79f574: changed the handling of already existing ep payments gateways

## 0.7.4

### Patch Changes

- c8f1cd0: improved error handling and workspace composablerc template fix
- Updated dependencies [c8f1cd0]
  - @elasticpath/d2c-schematics@0.8.3

## 0.7.3

### Patch Changes

- 7c5f29e: Added .composablerc file for storing project specific configuration
- Updated dependencies [7c5f29e]
  - @elasticpath/d2c-schematics@0.8.2

## 0.7.2

### Patch Changes

- 51b0df0: ep payments setup was not passing options correctly

## 0.7.1

### Patch Changes

- e143bbb: d2c generate command is now using the new ep payments ep-payments command for gateway setup
- 5782376: added ep payment gateway setup command
- Updated dependencies [5782376]
- Updated dependencies [e143bbb]
  - @elasticpath/d2c-schematics@0.8.1

## 0.7.0

### Minor Changes

- 85c20dc: CLI user can now execute the command `ep int algolia` to run the Algolia integration setup.

  - Checks if the active store has the Aloglia integration already
  - Creates and depolys the integration for the user for the active store
  - Prompts the user if they want to publish a catalog after the integration is configured as it's needed to start indexing
  - Waits for that new index to appear in Algolia and then applies additional confuration for facets and replicas

  This command is also used post `ep generate d2c` if the user selected the Algolia integration they are given a prompt to ask if they want to configure it now.

### Patch Changes

- Updated dependencies [85c20dc]
  - @elasticpath/d2c-schematics@0.8.0

## 0.6.2

### Patch Changes

- c67286c: Detecting user package manager for them
- c67286c: Bumped to latest version of moltin sdk
- Updated dependencies [c67286c]
- Updated dependencies [c67286c]
- Updated dependencies [c67286c]
  - @elasticpath/d2c-schematics@0.7.0

## 0.6.1

### Patch Changes

- 97eb6cf: Posthog should now have the correct public key

## 0.6.0

### Minor Changes

- d0fadcb: Composable cli now has a more complete set of commands

  - READ_ME has clear descirption on how to use the CLI
  - CLI now supports help functionality with examples
  - There are 7 new base commands - see the cli help for more information
    - login
    - logout
    - feedback
    - config
    - store
    - generate
    - insights

### Patch Changes

- Updated dependencies [d0fadcb]
- Updated dependencies [d0fadcb]
- Updated dependencies [d0fadcb]
- Updated dependencies [d0fadcb]
- Updated dependencies [d0fadcb]
  - @elasticpath/d2c-schematics@0.6.4

## 0.5.4

### Patch Changes

- 333d5a0: change to composable cli package from elasticpath npm scope to a root scoped package
- Updated dependencies [333d5a0]
  - @elasticpath/d2c-schematics@0.6.3

## 0.5.3

### Patch Changes

- 97c9a9d: Renamed mason packages and repository to composable and composable-cli to match the new naming convention.
- Updated dependencies [97c9a9d]
  - @elasticpath/d2c-schematics@0.6.2

## 0.5.2

### Patch Changes

- Updated dependencies [4a3b5cb]
  - @elasticpath/d2c-schematics@0.6.0

## 0.5.1

### Patch Changes

- d81ac4c: Fixed multi region support
- Updated dependencies [d81ac4c]
  - @elasticpath/d2c-schematics@0.5.2

## 0.5.0

### Minor Changes

- 231a966: D2C Schematic now supports an Algolia powered Product List Page (PLP) including automatic configuration of the EPCC Integration Hub

### Patch Changes

- Updated dependencies [231a966]
  - @elasticpath/d2c-schematics@0.5.0

## 0.4.2

### Patch Changes

- d469a6f: removed console logs
- Updated dependencies [d469a6f]
  - @elasticpath/d2c-schematics@0.4.5

## 0.4.1

### Patch Changes

- 9c04d10: Renamed to mason-cli

## 0.4.0

### Minor Changes

- 4d6bfa4: Created new schematics for header, footer, product-detail-page, home. Including two component schematics for featured-products and promotion-banner.

### Patch Changes

- Updated dependencies [4d6bfa4]
  - @elasticpath/d2c-schematics@0.4.0

## 0.3.2

### Patch Changes

- 150fb7f: added schematic as dependency for cli

## 0.3.1

### Patch Changes

- 0f69840: Debugging logs

## 0.3.0

### Minor Changes

- 0d4ea84: Moved schematics out to their own package.

## 0.2.8

### Patch Changes

- f976c14: Added angular example

## 0.2.7

### Patch Changes

- 4a29baf: fixed build

## 0.2.6

### Patch Changes

- 65ae0b2: Updated build

## 0.2.5

### Patch Changes

- 6e64c38: Fix build

## 0.2.4

### Patch Changes

- 122fa28: publish all files from dist

## 0.2.2

### Patch Changes

- cb52f9b: build: added directory to publish from.

## 0.2.1

### Patch Changes

- 471b10b: build: script path

## 0.2.0

### Minor Changes

- 1c71aee: Made public

## 0.1.0

### Minor Changes

- 5bf7a74: First deploy

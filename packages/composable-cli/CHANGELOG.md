# composable-cli

## 0.15.0

### Minor Changes

- 51d210c: Support Klevu integration auto config during generate command

### Patch Changes

- f76d021: use backoff for catalog publish waiting

## 0.14.1

### Patch Changes

- d25f938: Correct timeout used
- 49aedbc: hide Klevu rest auth key as \* masked during input

## 0.14.0

### Minor Changes

- e9da300: Remove the integration hub deployer using the latest marketplace integration for Algolia and Klevu

### Patch Changes

- Updated dependencies [e9da300]
- Updated dependencies [e9da300]
  - @elasticpath/composable-common@0.6.0
  - @elasticpath/d2c-schematics@0.22.0

## 0.13.1

### Patch Changes

- Updated dependencies [0a7d721]
  - @elasticpath/d2c-schematics@0.21.1

## 0.13.0

### Minor Changes

- 9bc676f: Add Klevu product details page support

### Patch Changes

- Updated dependencies [9bc676f]
  - @elasticpath/d2c-schematics@0.21.0

## 0.12.6

### Patch Changes

- Updated dependencies [3c88e05]
  - @elasticpath/d2c-schematics@0.20.0

## 0.12.5

### Patch Changes

- 6669af1: Update README to remove `Beta` tag

## 0.12.4

### Patch Changes

- Updated dependencies [d08dd1a]
  - @elasticpath/d2c-schematics@0.19.0

## 0.12.3

### Patch Changes

- Updated dependencies [92824a2]
  - @elasticpath/d2c-schematics@0.18.0

## 0.12.2

### Patch Changes

- Updated dependencies [6327581]
  - @elasticpath/d2c-schematics@0.17.0

## 0.12.1

### Patch Changes

- Updated dependencies [091eebd]
  - @elasticpath/d2c-schematics@0.16.0

## 0.12.0

### Minor Changes

- f890d84: Bump moltin version and fix it

### Patch Changes

- Updated dependencies [f890d84]
- Updated dependencies [f890d84]
  - @elasticpath/d2c-schematics@0.15.0
  - @elasticpath/composable-common@0.5.0

## 0.11.17

### Patch Changes

- 9d95712: add environment variables to test file as well
- Updated dependencies [7ea6396]
- Updated dependencies [e819f3d]
  - @elasticpath/d2c-schematics@0.14.6

## 0.11.16

### Patch Changes

- Updated dependencies [6aac4f9]
  - @elasticpath/d2c-schematics@0.14.5

## 0.11.15

### Patch Changes

- 72284ea: typo in schema filename
- ff454c6: checking if termainl the generate command is being run in supports TTY
- 993aac6: allow user to select their output location
- Updated dependencies [72284ea]
- Updated dependencies [993aac6]
  - @elasticpath/d2c-schematics@0.14.4

## 0.11.14

### Patch Changes

- b78405d: added a colon on the end of email and password prompt
- Updated dependencies [1ac76df]
  - @elasticpath/d2c-schematics@0.14.3

## 0.11.13

### Patch Changes

- 3a6cdf3: - checks if user is authenticated, prompts if user wants to continue
  - logout will show an info message if not logged in
- aa305e7: login command improved error handling and explanation

## 0.11.12

### Patch Changes

- 376f5ab: insight opt in defaults to true and improved messaging

## 0.11.11

### Patch Changes

- 373c393: fixed README html content, image now shows correctly

## 0.11.10

### Patch Changes

- 5e4eec7: automatically present login when unauthenticated and command requires authentication

## 0.11.9

### Patch Changes

- f38172b: .env.local should be updated with latest keys when using `ep int algolia` standalone

## 0.11.8

### Patch Changes

- d5119ef: updated feedback form to use latest info box and form link
- d5119ef: allow just options to work on root command e.g. `ep --version`

## 0.11.7

### Patch Changes

- be3a652: making it more clear for the user when ep payments was already setup and providing them clear next steps

## 0.11.6

### Patch Changes

- 40243bc: when cli called without root command default to help view

## 0.11.5

### Patch Changes

- 53bf76d: Should be using lowercase "s" in setup

## 0.11.4

### Patch Changes

- 09c8654: build command using --help instead of --h to keep aligned with all other help commands

## 0.11.3

### Patch Changes

- 6461e20: d2c is not the default command for generated meaning you don't need to pass the "d2c" argument

## 0.11.2

### Patch Changes

- 85eb224: Use fixed version workspace syntax
- Updated dependencies [85eb224]
  - @elasticpath/d2c-schematics@0.14.2

## 0.11.1

### Patch Changes

- ca2b3ab: Use latest version of d2c storefront

## 0.11.0

### Minor Changes

- 48160ba: Using listr tasks to manage configuration

  - added self sign up tasks
  - converted old approach to use tasks

### Patch Changes

- 48160ba: Added powered by stripe to ep payments label
- 48160ba: Bumped moltin/sdk version
- Updated dependencies [48160ba]
- Updated dependencies [48160ba]
- Updated dependencies [48160ba]
  - @elasticpath/composable-common@0.4.0
  - @elasticpath/d2c-schematics@0.14.0

## 0.10.3

### Patch Changes

- Updated dependencies [5f0df93]
  - @elasticpath/d2c-schematics@0.13.0

## 0.10.2

### Patch Changes

- 65e09a3: Use latest d2c schematic
- Updated dependencies [3ae082b]
  - @elasticpath/d2c-schematics@0.12.2

## 0.10.1

### Patch Changes

- 5f8211a: Using the latest d2c schematics

## 0.10.0

### Minor Changes

- 061bbfe: Added simple plp that uses Elastic Path directly and no third party dependencies

### Patch Changes

- f904b20: Workspace prefixes added and removed version from examples package.json
- Updated dependencies [061bbfe]
- Updated dependencies [f904b20]
  - @elasticpath/d2c-schematics@0.12.0

## 0.9.1

### Patch Changes

- 8797e84: bumped moltin sdk in all repos and d2c output
- Updated dependencies [8797e84]
- Updated dependencies [8797e84]
- Updated dependencies [c1d0fd1]
  - @elasticpath/composable-common@0.3.1
  - @elasticpath/d2c-schematics@0.11.1

## 0.9.0

### Minor Changes

- 0291e71: manual payment gateway support for d2c starter kit

### Patch Changes

- Updated dependencies [0291e71]
  - @elasticpath/d2c-schematics@0.11.0
  - @elasticpath/composable-common@0.3.0

## 0.8.15

### Patch Changes

- d5dcda0: algolia index name resolving fixed

## 0.8.14

### Patch Changes

- Updated dependencies [b327b4d]
  - @elasticpath/d2c-schematics@0.10.5

## 0.8.13

### Patch Changes

- 8623295: .composablerc should now be found correctly after generate

## 0.8.12

### Patch Changes

- Updated dependencies [e15e76f]
  - @elasticpath/d2c-schematics@0.10.4

## 0.8.11

### Patch Changes

- a1ef9a2: fix for globing issue
- Updated dependencies [a1ef9a2]
  - @elasticpath/composable-common@0.2.7
  - @elasticpath/d2c-schematics@0.10.3

## 0.8.10

### Patch Changes

- bced4ac: fix for esm issue

## 0.8.9

### Patch Changes

- bb05c3e: bumped devkit to support node 18
- Updated dependencies [bb05c3e]
  - @elasticpath/composable-common@0.2.6
  - @elasticpath/d2c-schematics@0.10.2
  - @elasticpath/composable-integration-hub-deployer@0.2.5

## 0.8.8

### Patch Changes

- cd0a8db: force release to fix version issue
- Updated dependencies [cd0a8db]
  - @elasticpath/composable-common@0.2.5
  - @elasticpath/composable-integration-hub-deployer@0.2.4
  - @elasticpath/d2c-schematics@0.10.1

## 0.8.7

### Patch Changes

- 462cccd: Migrated D2C starter kit to Next.js 13 App directory routing
- e1f97c9: lock version of react shopper hooks inside d2c output
- Updated dependencies [462cccd]
- Updated dependencies [462cccd]
- Updated dependencies [e1f97c9]
  - @elasticpath/d2c-schematics@0.10.0

## 0.8.6

### Patch Changes

- Updated dependencies [34a3be2]
  - @elasticpath/composable-common@0.2.4
  - @elasticpath/composable-integration-hub-deployer@0.2.3
  - @elasticpath/d2c-schematics@0.9.3

## 0.8.5

### Patch Changes

- 6f21687: ### migrated from yarn to pnpm

  - Having issue managing the yarn workspace moved to pnpm

- Updated dependencies [6f21687]
  - @elasticpath/composable-integration-hub-deployer@0.2.2
  - @elasticpath/composable-common@0.2.3
  - @elasticpath/d2c-schematics@0.9.2

## 0.8.4

### Patch Changes

- d640de1: use explicit versioning
- Updated dependencies [d640de1]
- Updated dependencies [2fdb8aa]
- Updated dependencies [19ada03]
  - @elasticpath/d2c-schematics@0.9.1

## 0.8.3

### Patch Changes

- dd0a48c: - bumped moltin sdk version
- Updated dependencies [dd0a48c]
- Updated dependencies [dd0a48c]
  - @elasticpath/d2c-schematics@0.9.0

## 0.8.2

### Patch Changes

- 29bbab8: added IN_PROGRESS status and handling for publish catalog

## 0.8.1

### Patch Changes

- a15a234: handle users entering a sentence case project name be always converting to kebab case

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

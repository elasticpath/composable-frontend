---
"@elasticpath/composable-integration-hub-deployer": minor
"@elasticpath/composable-common": minor
"composable-cli": minor
"@elasticpath/d2c-schematics": minor
---

CLI user can now execute the command `ep int algolia` to run the Algolia integration setup.

- Checks if the active store has the Aloglia integration already
- Creates and depolys the integration for the user for the active store
- Prompts the user if they want to publish a catalog after the integration is configured as it's needed to start indexing
- Waits for that new index to appear in Algolia and then applies additional confuration for facets and replicas

This command is also used post `ep generate d2c` if the user selected the Algolia integration they are given a prompt to ask if they want to configure it now.
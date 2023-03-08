import { ALGOLIA_INTEGRATION_NAME } from "./constants"

export const errorMessages = {
  EPCC_INTEGRATION_AUTH_TOKEN:
    "Failed to get the integration auth token from EPCC.",
  INTEGRATION_USER_DETAILS:
    "Failed to get the integration user details integration hub.",
  UNKNOWN: "Unexpected exception was thrown.",
  MISSING_CUSTOMER_ID: "Customer id was missing from user info.",
  INTEGRATION_GET_INTEGRATION: "Failed to get integration details.",
  ALREADY_INTEGRATION_INSTANCE: `Already an integration instance for integration ${ALGOLIA_INTEGRATION_NAME}`,
  EPCC_API_KEYS: `Failed to create EPCC api keys for integration ${ALGOLIA_INTEGRATION_NAME}`,
  EPCC_API_KEYS_SECRET: "Missing client_secret on response from EPCC api keys.",
  CREATE_INTEGRATION_INSTANCE: `Failed creating an integration instance for ${ALGOLIA_INTEGRATION_NAME}`,
  DEPLOY_INTEGRATION_INSTANCE: `Failed to deploy integration instsance for ${ALGOLIA_INTEGRATION_NAME}`,
} as const

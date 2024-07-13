import { ALGOLIA_INTEGRATION_NAME } from "./constants"

export const errorCodes = [
  "EPCC_INTEGRATION_AUTH_TOKEN",
  "INTEGRATION_USER_DETAILS",
  "UNKNOWN",
  "UNKNOWN_CAUGHT_ENDPOINT",
  "MISSING_CUSTOMER_ID",
  "INTEGRATION_GET_INTEGRATION",
  "ALREADY_INTEGRATION_INSTANCE",
  "EPCC_API_KEYS",
  "EPCC_API_KEYS_SECRET",
  "CREATE_INTEGRATION_INSTANCE",
  "DEPLOY_INTEGRATION_INSTANCE",
  "MISSING_ALGOLIA_INTEGRATION_ID_ENV_VAR",
  "MISSING_ALGOLIA_INTEGRATION_NAME_ENV_VAR",
  "CUSTOMER_NOT_ALLOWED_ADD_INSTANCE",
  "CUSTOMER_JWT_DECODE",
] as const

export type ErrorCodes = (typeof errorCodes)[number]

export const errorMessages: Record<ErrorCodes, string> = {
  EPCC_INTEGRATION_AUTH_TOKEN:
    "Failed to get the integration auth token from EPCC.",
  INTEGRATION_USER_DETAILS:
    "Failed to get the integration user details integration hub.",
  UNKNOWN: "Unexpected exception was thrown.",
  UNKNOWN_CAUGHT_ENDPOINT: "Unexpected error was thrown on an endpoint",
  MISSING_CUSTOMER_ID: "Customer id was missing from user info.",
  INTEGRATION_GET_INTEGRATION: "Failed to get integration details.",
  ALREADY_INTEGRATION_INSTANCE: `Already an integration instance for integration ${ALGOLIA_INTEGRATION_NAME}`,
  EPCC_API_KEYS: `Failed to create EPCC api keys for integration ${ALGOLIA_INTEGRATION_NAME}`,
  EPCC_API_KEYS_SECRET: "Missing client_secret on response from EPCC api keys.",
  CREATE_INTEGRATION_INSTANCE: `Failed creating an integration instance for ${ALGOLIA_INTEGRATION_NAME}`,
  DEPLOY_INTEGRATION_INSTANCE: `Failed to deploy integration instsance for ${ALGOLIA_INTEGRATION_NAME}`,
  MISSING_ALGOLIA_INTEGRATION_ID_ENV_VAR: `Missing the id environment variable for ${ALGOLIA_INTEGRATION_NAME} version.`,
  MISSING_ALGOLIA_INTEGRATION_NAME_ENV_VAR: `Missing the name environment variable for ${ALGOLIA_INTEGRATION_NAME} version.`,
  CUSTOMER_NOT_ALLOWED_ADD_INSTANCE:
    "Customer is not allowed to add integration instance.",
  CUSTOMER_JWT_DECODE: "Customer jwt token failed to decode correctly",
} as const

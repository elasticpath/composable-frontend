import { ALGOLIA_INTEGRATION_NAME, KLEVU_INTEGRATION_NAME } from "./constants"

export const sharedErrorCodes = [
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
  "CUSTOMER_NOT_ALLOWED_ADD_INSTANCE",
  "CUSTOMER_JWT_DECODE",
] as const

export function createErrorMessageLookup({
  integrationName,
}: {
  integrationName: string
}) {
  return {
    EPCC_INTEGRATION_AUTH_TOKEN:
      "Failed to get the integration auth token from EPCC.",
    INTEGRATION_USER_DETAILS:
      "Failed to get the integration user details integration hub.",
    UNKNOWN: "Unexpected exception was thrown.",
    UNKNOWN_CAUGHT_ENDPOINT: "Unexpected error was thrown on an endpoint",
    MISSING_CUSTOMER_ID: "Customer id was missing from user info.",
    INTEGRATION_GET_INTEGRATION: "Failed to get integration details.",
    ALREADY_INTEGRATION_INSTANCE: `Already an integration instance for integration ${integrationName}`,
    EPCC_API_KEYS: `Failed to create EPCC api keys for integration ${integrationName}`,
    EPCC_API_KEYS_SECRET:
      "Missing client_secret on response from EPCC api keys.",
    CREATE_INTEGRATION_INSTANCE: `Failed creating an integration instance for ${integrationName}`,
    DEPLOY_INTEGRATION_INSTANCE: `Failed to deploy integration instsance for ${integrationName}`,
    CUSTOMER_NOT_ALLOWED_ADD_INSTANCE:
      "Customer is not allowed to add integration instance.",
    CUSTOMER_JWT_DECODE: "Customer jwt token failed to decode correctly",
  }
}

// Algolia

export const errorCodes = [
  ...sharedErrorCodes,
  "MISSING_ALGOLIA_INTEGRATION_ID_ENV_VAR",
  "MISSING_ALGOLIA_INTEGRATION_NAME_ENV_VAR",
] as const

export type ErrorCodes = (typeof errorCodes)[number]

export const errorMessages: Record<ErrorCodes, string> = {
  ...createErrorMessageLookup({ integrationName: ALGOLIA_INTEGRATION_NAME }),
  MISSING_ALGOLIA_INTEGRATION_ID_ENV_VAR: `Missing the id environment variable for ${ALGOLIA_INTEGRATION_NAME} version.`,
  MISSING_ALGOLIA_INTEGRATION_NAME_ENV_VAR: `Missing the name environment variable for ${ALGOLIA_INTEGRATION_NAME} version.`,
} as const

// Klevu

export const klevuErrorCodes = [
  ...sharedErrorCodes,
  "MISSING_KLEVU_INTEGRATION_ID_ENV_VAR",
  "MISSING_KLEVU_INTEGRATION_NAME_ENV_VAR",
] as const

export type KlevuErrorCodes = (typeof klevuErrorCodes)[number]

export const klevuErrorMessages: Record<KlevuErrorCodes, string> = {
  ...createErrorMessageLookup({ integrationName: KLEVU_INTEGRATION_NAME }),
  MISSING_KLEVU_INTEGRATION_ID_ENV_VAR: `Missing the id environment variable for ${KLEVU_INTEGRATION_NAME} version.`,
  MISSING_KLEVU_INTEGRATION_NAME_ENV_VAR: `Missing the name environment variable for ${KLEVU_INTEGRATION_NAME} version.`,
}

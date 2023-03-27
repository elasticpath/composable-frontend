import {
  ALGOLIA_INTEGRATION_ID,
  ALGOLIA_INTEGRATION_NAME,
  createAlgoliaIntegrationConfig,
  createIntegrationInstance,
  createUrqlClient,
  createWebhookSecretKey,
  didRequestFail,
  getMarketplaceIntegrationByName,
  getUserInfo,
  IntegrationCreateConfig,
  integrationCreateConfigSchema,
  IntegrationCreateResult,
  integrationCreateResultSchema,
  resolveEpccBaseUrl,
  resolveErrorResponse,
} from "@elasticpath/mason-common"
import { protectedProcedure } from "../server"
import { getSystemAccessToken } from "../get-system-access-token"
import { initLogger } from "../logger/logger"

export const createIntegrationMutation = protectedProcedure
  .input(integrationCreateConfigSchema)
  .output(integrationCreateResultSchema)
  .mutation(async (req) => {
    switch (req.input.name) {
      case "algolia": {
        if (!req.ctx.creds) {
          return {
            success: false,
            name: "algolia",
            code: "UNKNOWN",
            reason: "Unauthenticated",
          }
        }
        return algoliaCreateIntegrationHandler(req.input, req.ctx.creds)
      }
    }
  })

const logger = initLogger({
  ...(process.env.DATADOG_API_KEY
    ? {
        datadog: {
          apiKey: process.env.DATADOG_API_KEY,
          service: "mason-integration-hub-deployer",
        },
      }
    : {}),
})

export async function algoliaCreateIntegrationHandler(
  config: IntegrationCreateConfig,
  creds: string
): Promise<IntegrationCreateResult> {
  const {
    epccConfig: { clientId, clientSecret, host },
    appId,
    adminApiKey,
  } = config
  const customerUrqlClient = createUrqlClient(creds, host)

  /**
   * Validate the customer token by getting user info
   */
  const userInfo = await getUserInfo(customerUrqlClient)
  logger.info(`userInfo: ${JSON.stringify(userInfo)}`)

  logger.info(
    `request: ${JSON.stringify(
      !userInfo.success ? userInfo.error.message : ""
    )}`
  )

  if (didRequestFail(userInfo)) {
    return resolveErrorResponse("INTEGRATION_USER_DETAILS", userInfo.error)
  }

  if (!userInfo.data.customer?.allowAddInstance) {
    return resolveErrorResponse("CUSTOMER_NOT_ALLOWED_ADD_INSTANCE")
  }

  const customerId = userInfo.data.customer?.id

  if (customerId === undefined) {
    return resolveErrorResponse("MISSING_CUSTOMER_ID")
  }

  /**
   * Loose check to make sure the user is allowed to create an instance of the specified integration
   *
   * if an integration with the name shows up in their marketplace integration response then considered them allowed.
   */
  const integrationResp = await getMarketplaceIntegrationByName(
    customerUrqlClient,
    {
      name: ALGOLIA_INTEGRATION_NAME,
    }
  )

  logger.info(`getIntegration: ${integrationResp.success}`)

  if (didRequestFail(integrationResp)) {
    return resolveErrorResponse(
      "INTEGRATION_GET_INTEGRATION",
      integrationResp.error
    )
  }

  if (!userInfo.data.customer?.externalId) {
    return resolveErrorResponse(
      "CREATE_INTEGRATION_INSTANCE",
      new Error(`Missing external id for customer.`)
    )
  }

  /**
   * Get access token for system user
   */
  const systemUserAccessTokenResult = await getSystemAccessToken(
    userInfo.data.customer.externalId
  )

  if (!systemUserAccessTokenResult.success) {
    return resolveErrorResponse(
      "CREATE_INTEGRATION_INSTANCE",
      systemUserAccessTokenResult.error
    )
  }

  const systemUrqlClient = createUrqlClient(
    systemUserAccessTokenResult.token,
    host
  )

  const epccBaseUrl = resolveEpccBaseUrl(host)

  const createdInstanceResponse = await createIntegrationInstance(
    systemUrqlClient,
    {
      integrationId: ALGOLIA_INTEGRATION_ID,
      customerId,
      name: ALGOLIA_INTEGRATION_NAME,
      description: "Algolia Integration",
      configVariables: createAlgoliaIntegrationConfig({
        algoliaAppId: appId,
        algoliaAdminApiKey: adminApiKey,
        epccComponentConnectionShared: {
          clientId,
          clientSecret,
          tokenUrl: `${epccBaseUrl}/oauth/access_token`,
        },
        webhookKey: createWebhookSecretKey(),
        epccBaseUrl: `${epccBaseUrl}`,
      }),
    }
  )

  if (didRequestFail(createdInstanceResponse)) {
    return resolveErrorResponse(
      "CREATE_INTEGRATION_INSTANCE",
      createdInstanceResponse.error
    )
  }

  logger.info(
    `response to create integration instance: ${JSON.stringify(
      createdInstanceResponse.data
    )}`
  )

  return {
    success: true,
    name: "algolia",
    result: createdInstanceResponse.data,
  }
}

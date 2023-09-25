import {
  ALGOLIA_INTEGRATION_NAME,
  AlgoliaIntegrationCreateResult,
  AlgoliaIntegrationSettings,
  createEpccApiKey,
  createEpccClient,
  createUrqlClient,
  deployIntegrationInstance,
  didRequestFail,
  doesIntegrationInstanceExist,
  getUserInfo,
  integrationAuthToken,
  performConnectionConfigAuthorisation,
  resolveErrorResponse,
  resolveRegion,
} from "@elasticpath/composable-common"
import type { Instance } from "@elasticpath/composable-common"
import { createTRPCClient } from "./create-trpc-client"
import AbortController from "abort-controller"
import ws from "ws"
import { logging } from "@angular-devkit/core"
import fetch from "node-fetch"

// polyfill fetch & websocket
const globalAny = global as any
globalAny.AbortController = AbortController
globalAny.fetch = fetch
globalAny.WebSocket = ws

export async function setupAlgoliaIntegration(
  sourceInput: Omit<AlgoliaIntegrationSettings, "name">,
  logger: logging.LoggerApi
): Promise<AlgoliaIntegrationCreateResult> {
  let unsubscribe: (() => void)[] = []
  try {
    const {
      host: epccHost,
      clientId: epccClientId,
      clientSecret: epccClientSecret,
    } = sourceInput.epccConfig

    const epccClient = createEpccClient({
      host: epccHost,
      client_id: epccClientId,
      client_secret: epccClientSecret,
    })

    /**
     * Get the prismatic auth token from EPCC
     */
    const tokenResp = await integrationAuthToken(epccClient)

    if (didRequestFail(tokenResp)) {
      return resolveErrorResponse(
        "EPCC_INTEGRATION_AUTH_TOKEN",
        tokenResp.error
      )
    }

    const region = resolveRegion(epccHost)

    const customerUrqlClient = createUrqlClient(tokenResp.data.jwtToken, region)
    const { unsubscribe: debugUnsubscribe } =
      customerUrqlClient.subscribeToDebugTarget!((event) => {
        if (event.source === "dedupExchange") return
        logger.debug(
          `[GraphQL client event][${event.type}][${event.operation.kind}][${event.operation.context.url}] ${event.message}`
        )
      })
    unsubscribe = [...unsubscribe, debugUnsubscribe]

    /**
     * Get the user info for the customer
     */
    const userInfo = await getUserInfo(customerUrqlClient)

    if (didRequestFail(userInfo)) {
      return resolveErrorResponse("INTEGRATION_USER_DETAILS", userInfo.error)
    }

    const customerId = userInfo.data.customer?.id

    if (customerId === undefined) {
      return resolveErrorResponse("MISSING_CUSTOMER_ID")
    }

    /**
     * Check if instance exists on epcc store
     */
    const doesExist = await doesIntegrationInstanceExist(
      customerUrqlClient,
      customerId,
      ALGOLIA_INTEGRATION_NAME
    )
    doesExist &&
      logger.debug(
        `${ALGOLIA_INTEGRATION_NAME} integration instance already exists for the customer ${customerId}`
      )

    if (doesExist) {
      return {
        success: true,
        name: "algolia",
        result: {
          reason: "Instance already exists",
        },
      }
    }

    /**
     * Create a dedicated api key for the integration
     */
    const apiKeyResp = await createEpccApiKey(
      epccClient,
      `algolia-integration-${new Date().toISOString()}`
    )

    if (didRequestFail(apiKeyResp)) {
      return resolveErrorResponse("EPCC_API_KEYS", apiKeyResp.error)
    }

    const { client_id: createdClientId, client_secret: createdClientSecret } =
      apiKeyResp.data

    if (!createdClientSecret) {
      return resolveErrorResponse("EPCC_API_KEYS_SECRET")
    }

    /**
     * Using the custom create instance endpoint to create a fixed version of Algolia integration
     */
    const tRPCClient = createTRPCClient(tokenResp.data.jwtToken)

    const createdInstanceResp = await tRPCClient.createIntegration.mutate({
      ...sourceInput,
      name: "algolia",
      epccConfig: {
        ...sourceInput.epccConfig,
        clientId: createdClientId,
        clientSecret: createdClientSecret,
      },
    })

    if (
      !(
        createdInstanceResp.success === true &&
        createdInstanceResp.name === "algolia"
      )
    ) {
      return resolveErrorResponse(
        (createdInstanceResp as any).code ?? "UNKNOWN",
        (createdInstanceResp as any)?.reason
      )
    }

    // TODO correct schema type
    const createdInstance: Instance = (createdInstanceResp as any).result
    logger.debug(
      `Created instance of ${createdInstance.name} integration for customer ${createdInstance.customer?.id}`
    )

    /**
     * Perform the EPCC connection auth request
     */
    const connectionResp = await performConnectionConfigAuthorisation(
      createdInstance
    )
    logger.debug(
      `Connection configuration responses ${JSON.stringify(connectionResp)}`
    )

    /**
     * Deploy the configured instance
     */
    const deployResult = await deployIntegrationInstance(customerUrqlClient, {
      instanceId: createdInstance.id,
    })

    if (didRequestFail(deployResult)) {
      return resolveErrorResponse(
        "DEPLOY_INTEGRATION_INSTANCE",
        deployResult.error
      )
    }

    logger.debug(
      `Deployed ${deployResult.data.instance?.name} integration instance successfully for customer ${deployResult.data.instance?.customer.id}`
    )

    return {
      success: true,
      name: "algolia",
      result: deployResult.data.instance,
    }
  } catch (err: unknown) {
    logger.error(
      `An unknown error occurred: ${
        err instanceof Error
          ? `${err.name} = ${err.message}`
          : JSON.stringify(err)
      }`
    )
    return resolveErrorResponse(
      "UNKNOWN",
      err instanceof Error ? err : undefined
    )
  } finally {
    unsubscribe.forEach((unsubFn) => unsubFn())
  }
}

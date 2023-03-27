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
  fetch,
  getUserInfo,
  integrationAuthToken,
  performConnectionConfigAuthorisation,
  resolveErrorResponse,
} from "@elasticpath/mason-common"
import { createTRPCClient } from "./create-trpc-client"
import AbortController from "abort-controller"
import ws from "ws"

// polyfill fetch & websocket
const globalAny = global as any
globalAny.AbortController = AbortController
globalAny.fetch = fetch
globalAny.WebSocket = ws

export async function setupAlgoliaIntegration(
  sourceInput: Omit<AlgoliaIntegrationSettings, "name">
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
    console.log("tokenResp: ", tokenResp)

    if (didRequestFail(tokenResp)) {
      return resolveErrorResponse(
        "EPCC_INTEGRATION_AUTH_TOKEN",
        tokenResp.error
      )
    }

    const customerUrqlClient = createUrqlClient(
      tokenResp.data.jwtToken,
      epccHost
    )
    const { unsubscribe: customerDebugUnsubscribe } =
      customerUrqlClient.subscribeToDebugTarget!((event) => {
        if (event.source === "dedupExchange") return
        console.log("customerDebugUnsubscribe", event) // { type, message, operation, data, source, timestamp }
      })
    unsubscribe = [...unsubscribe, customerDebugUnsubscribe]

    /**
     * Get the user info for the customer
     */
    const userInfo = await getUserInfo(customerUrqlClient)
    console.log("userInfo: ", userInfo)

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
    console.log("does integration instance exist?: ", doesExist)

    if (doesExist) {
      return resolveErrorResponse("ALREADY_INTEGRATION_INSTANCE")
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
      return resolveErrorResponse("UNKNOWN", new Error("testing"))
    }

    // TODO correct schema type
    // @ts-ignore
    const createdInstance = createdInstanceResp.result
    console.log("createdInstance result: ", createdInstance)

    /**
     * Perform the EPCC connection auth request
     */
    const val = await performConnectionConfigAuthorisation(createdInstance)
    console.log("auth attempt responses: ", val)

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

    console.log(
      "deploy result: ",
      deployResult.data.errors,
      deployResult.data.instance
    )
    return {
      success: true,
      name: "algolia",
      result: deployResult.data.instance,
    }
  } catch (err: unknown) {
    console.error(err)
    return resolveErrorResponse(
      "UNKNOWN",
      err instanceof Error ? err : undefined
    )
  } finally {
    unsubscribe.forEach((unsubFn) => unsubFn())
  }
}

import {
  ALGOLIA_INTEGRATION_NAME,
  AlgoliaIntegrationCreateResult,
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
import { logging } from "@angular-devkit/core"
import { createApplicationKeys } from "../../../../../util/create-client-secret"
import ora from "ora"
import { AlgoliaIntegrationSetup } from "./setup-algolia-schema"
import { EpccRequester } from "../../../../../util/command"

export async function setupAlgoliaIntegration(
  sourceInput: AlgoliaIntegrationSetup,
  requester: EpccRequester,
  logger: logging.LoggerApi,
): Promise<AlgoliaIntegrationCreateResult> {
  let unsubscribe: (() => void)[] = []
  try {
    const { host: epccHost, accessToken } = sourceInput
    const spinner = ora("Resolve integration auth token").start()

    /**
     * Get the prismatic auth token from EPCC
     */
    const tokenResp = await integrationAuthToken(epccHost, accessToken)

    if (didRequestFail(tokenResp)) {
      spinner.fail("Failed to resolve integration auth token")
      return resolveErrorResponse(
        "EPCC_INTEGRATION_AUTH_TOKEN",
        tokenResp.error,
      )
    }

    spinner.text = "Resolve region"

    const region = resolveRegion(epccHost)

    const customerUrqlClient = createUrqlClient(tokenResp.data.jwtToken, region)
    const { unsubscribe: debugUnsubscribe } =
      customerUrqlClient.subscribeToDebugTarget!((event) => {
        if (event.source === "dedupExchange") return
        logger.debug(
          `[GraphQL client event][${event.type}][${event.operation.kind}][${event.operation.context.url}] ${event.message}`,
        )
      })
    unsubscribe = [...unsubscribe, debugUnsubscribe]

    spinner.text = "Getting user information"

    /**
     * Get the user info for the customer
     */
    const userInfo = await getUserInfo(customerUrqlClient)

    if (didRequestFail(userInfo)) {
      spinner.fail("Failed to get user information")
      return resolveErrorResponse("INTEGRATION_USER_DETAILS", userInfo.error)
    }

    const customerId = userInfo.data.customer?.id

    if (customerId === undefined) {
      spinner.fail("Failed to get customer id")
      return resolveErrorResponse("MISSING_CUSTOMER_ID")
    }

    spinner.text = "Checking if integration already exists for store..."
    /**
     * Check if instance exists on epcc store
     */
    const doesExist = await doesIntegrationInstanceExist(
      customerUrqlClient,
      customerId,
      ALGOLIA_INTEGRATION_NAME,
    )
    doesExist &&
      logger.debug(
        `${ALGOLIA_INTEGRATION_NAME} integration instance already exists for the customer ${customerId}`,
      )

    if (doesExist) {
      spinner.succeed("Integration already exists for store")
      return {
        success: true,
        name: "algolia",
        result: {
          reason: "Instance already exists",
        },
      }
    }

    spinner.text = "Creating a dedicated api key for the integration..."
    /**
     * Create a dedicated api key for the integration
     */
    const apiKeyResp = await createApplicationKeys(
      requester,
      `algolia-integration-${new Date().toISOString()}`,
    )

    if (didRequestFail(apiKeyResp)) {
      spinner.fail("Failed to create a dedicated api key for the integration")
      return resolveErrorResponse("EPCC_API_KEYS", apiKeyResp.error)
    }

    const { client_id: createdClientId, client_secret: createdClientSecret } =
      apiKeyResp.data

    if (!createdClientSecret) {
      spinner.fail("Failed missing client secret")
      return resolveErrorResponse("EPCC_API_KEYS_SECRET")
    }

    /**
     * Using the custom create instance endpoint to create a fixed version of Algolia integration
     */
    const tRPCClient = createTRPCClient(tokenResp.data.jwtToken)

    spinner.text = "Creating integration instance..."

    const createdInstanceResp = await tRPCClient.createIntegration.mutate({
      ...sourceInput,
      name: "algolia",
      epccConfig: {
        host: epccHost,
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
      spinner.fail("Failed to create integration instance")
      return resolveErrorResponse(
        (createdInstanceResp as any).code ?? "UNKNOWN",
        (createdInstanceResp as any)?.reason,
      )
    }

    // TODO correct schema type
    const createdInstance: Instance = (createdInstanceResp as any).result
    logger.debug(
      `Created instance of ${createdInstance.name} integration for customer ${createdInstance.customer?.id}`,
    )

    spinner.text = "Performing connection configuration authorisation..."
    /**
     * Perform the EPCC connection auth request
     */
    const connectionResp =
      await performConnectionConfigAuthorisation(createdInstance)
    logger.debug(
      `Connection configuration responses ${JSON.stringify(connectionResp)}`,
    )

    spinner.text = "Deploying integration instance..."

    /**
     * Deploy the configured instance
     */
    const deployResult = await deployIntegrationInstance(customerUrqlClient, {
      instanceId: createdInstance.id,
    })

    if (didRequestFail(deployResult)) {
      spinner.fail("Failed to deploy integration instance")
      return resolveErrorResponse(
        "DEPLOY_INTEGRATION_INSTANCE",
        deployResult.error,
      )
    }

    logger.debug(
      `Deployed ${deployResult.data.instance?.name} integration instance successfully for customer ${deployResult.data.instance?.customer.id}`,
    )

    spinner.succeed("Successfully deployed integration instance")
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
      }`,
    )
    return resolveErrorResponse(
      "UNKNOWN",
      err instanceof Error ? err : undefined,
    )
  } finally {
    unsubscribe.forEach((unsubFn) => unsubFn())
  }
}

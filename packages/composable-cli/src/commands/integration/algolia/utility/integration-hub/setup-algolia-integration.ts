import {
  ALGOLIA_INTEGRATION_NAME,
  AlgoliaIntegrationCreateResult,
  createUrqlClient,
  DeployedInstanceData,
  deployIntegrationInstance,
  didRequestFail,
  doesIntegrationInstanceExist,
  getUserInfo,
  integrationAuthToken,
  performConnectionConfigAuthorisation,
  resolveRegion,
} from "@elasticpath/composable-common"
import type { Instance } from "@elasticpath/composable-common"
import { createTRPCClient } from "./create-trpc-client"
import { createApplicationKeys } from "../../../../../util/create-client-secret"
import { AlgoliaIntegrationSetup } from "./setup-algolia-schema"
import { EpccRequester } from "../../../../../util/command"
import { ListrLogger, ListrTaskWrapper, ListrRendererFactory } from "listr2"
import { AlgoliaIntegrationTaskContext } from "../algolia/types"

const listrLogger = new ListrLogger()

export type AlgoliaSetupTasksContext = {
  ihToken?: string
  customerUrqlClient?: ReturnType<typeof createUrqlClient>
  customerId?: string
  createdCredentials?: {
    clientId: string
    clientSecret: string
  }
  createdInstance?: Instance
  deployedResult?: DeployedInstanceData
}

export async function setupAlgoliaIntegration(
  sourceInput: AlgoliaIntegrationSetup,
  requester: EpccRequester,
  taskWrapper: ListrTaskWrapper<
    AlgoliaIntegrationTaskContext,
    ListrRendererFactory,
    ListrRendererFactory
  >,
): Promise<AlgoliaIntegrationCreateResult> {
  let unsubscribe: (() => void)[] = []
  try {
    const { host: epccHost, accessToken } = sourceInput

    const tasks = taskWrapper.newListr<AlgoliaSetupTasksContext>([
      {
        title: "Get the integration hub auth token from Elastic Path",
        task: async (ctx) => {
          /**
           * Get the prismatic auth token from EPCC
           */
          const tokenResp = await integrationAuthToken(epccHost, accessToken)

          if (didRequestFail(tokenResp)) {
            throw new Error(
              `Failed to get integration hub auth token - ${tokenResp.error.message}`,
            )
          }

          listrLogger.log(
            "info",
            `Got integration hub auth token ${tokenResp.data.jwtToken}`,
          )

          ctx.ihToken = tokenResp.data.jwtToken
        },
      },
      {
        title: "Create Urql client",
        task: async (ctx) => {
          if (!ctx.ihToken) {
            throw new Error(
              "Integration hub auth token is missing failed to setup algolia integration",
            )
          }

          const region = resolveRegion(epccHost)

          const customerUrqlClient = createUrqlClient(ctx.ihToken, region)
          const { unsubscribe: debugUnsubscribe } =
            customerUrqlClient.subscribeToDebugTarget!((event) => {
              if (event.source === "dedupExchange") return
              listrLogger.log(
                "debug",
                `[GraphQL client event][${event.type}][${event.operation.kind}][${event.operation.context.url}] ${event.message}`,
              )
            })
          unsubscribe = [...unsubscribe, debugUnsubscribe]

          ctx.customerUrqlClient = customerUrqlClient
        },
      },
      {
        title: "Get the user info for the customer",
        task: async (ctx) => {
          if (!ctx.customerUrqlClient) {
            throw new Error(
              "Urql client is missing failed to setup algolia integration",
            )
          }

          /**
           * Get the user info for the customer
           */
          const userInfo = await getUserInfo(ctx.customerUrqlClient)

          if (didRequestFail(userInfo)) {
            throw new Error(
              `Failed to get user info - ${userInfo.error.message}`,
            )
          }

          const customerId = userInfo.data.customer?.id

          if (customerId === undefined) {
            throw new Error("Failed to get customer id from user info")
          }

          ctx.customerId = customerId
        },
      },
      {
        title: "Check if instance exists on Elastic Path store",
        task: async (ctx, parentTask) => {
          const { customerId, customerUrqlClient } = ctx
          if (!customerUrqlClient) {
            throw new Error(
              "Urql client is missing failed to setup algolia integration",
            )
          }

          if (!customerId) {
            throw new Error(
              "Customer id is missing failed to setup algolia integration",
            )
          }

          /**
           * Check if instance exists on epcc store
           */
          const doesExist = await doesIntegrationInstanceExist(
            customerUrqlClient,
            customerId,
            ALGOLIA_INTEGRATION_NAME,
          )
          doesExist &&
            listrLogger.log(
              "debug",
              `${ALGOLIA_INTEGRATION_NAME} integration instance already exists for the customer ${customerId}`,
            )

          if (doesExist) {
            parentTask.skip("Algolia Integration instance already exists")
          }
        },
      },
      {
        title: "Create a dedicated api key for the integration",
        task: async (ctx) => {
          /**
           * Create a dedicated api key for the integration
           */
          const apiKeyResp = await createApplicationKeys(
            requester,
            `algolia-integration-${new Date().toISOString()}`,
          )

          if (didRequestFail(apiKeyResp)) {
            throw new Error(
              `Failed to create api key - ${apiKeyResp.error.message}`,
            )
          }

          const { client_id, client_secret } = apiKeyResp.data

          if (!client_secret) {
            throw new Error("Failed to get client secret from api key response")
          }

          ctx.createdCredentials = {
            clientId: client_id,
            clientSecret: client_secret,
          }
        },
      },
      {
        title: "Create the Algolia Integration instance",
        task: async (ctx) => {
          const { ihToken, createdCredentials } = ctx
          if (!ihToken) {
            throw new Error(
              "Integration hub auth token is missing failed to setup algolia integration",
            )
          }

          if (!createdCredentials) {
            throw new Error(
              "Created credentials are missing failed to setup algolia integration",
            )
          }

          /**
           * Using the custom create instance endpoint to create a fixed version of Algolia integration
           */
          const tRPCClient = createTRPCClient(ihToken)

          const createdInstanceResp = await tRPCClient.createIntegration.mutate(
            {
              ...sourceInput,
              name: "algolia",
              epccConfig: {
                host: epccHost,
                clientId: createdCredentials.clientId,
                clientSecret: createdCredentials.clientSecret,
              },
            },
          )

          if (
            !(
              createdInstanceResp.success === true &&
              createdInstanceResp.name === "algolia"
            )
          ) {
            throw new Error(
              `Failed to create Algolia integration instance - ${
                (createdInstanceResp as any).code ?? "UNKNOWN"
              } ${(createdInstanceResp as any)?.reason}`,
            )
          }

          // TODO correct schema type
          const createdInstance: Instance = (createdInstanceResp as any).result
          listrLogger.log(
            "debug",
            `Created instance of ${createdInstance.name} integration for customer ${createdInstance.customer?.id}`,
          )

          ctx.createdInstance = createdInstance
        },
      },
      {
        title: "Perform the EPCC connection auth request",
        task: async (ctx) => {
          const { createdInstance } = ctx

          if (!createdInstance) {
            throw new Error(
              "Created instance is missing failed to setup algolia integration",
            )
          }

          /**
           * Perform the EPCC connection auth request
           */
          const connectionResp =
            await performConnectionConfigAuthorisation(createdInstance)
          listrLogger.log(
            "debug",
            `Connection configuration responses ${JSON.stringify(
              connectionResp,
            )}`,
          )
        },
      },
      {
        title: "Deploy the configured instance",
        task: async (ctx) => {
          const { customerUrqlClient, createdInstance } = ctx

          if (!customerUrqlClient) {
            throw new Error(
              "Urql client is missing failed to setup algolia integration",
            )
          }

          if (!createdInstance) {
            throw new Error(
              "Created instance is missing failed to setup algolia integration",
            )
          }

          /**
           * Deploy the configured instance
           */
          const deployResult = await deployIntegrationInstance(
            customerUrqlClient,
            {
              instanceId: createdInstance.id,
            },
          )

          if (didRequestFail(deployResult)) {
            throw new Error(
              `Failed to deploy integration instance - ${deployResult.error.message}`,
            )
          }

          listrLogger.log(
            "debug",
            `Deployed ${deployResult.data.instance?.name} integration instance successfully for customer ${deployResult.data.instance?.customer.id}`,
          )

          ctx.deployedResult = deployResult.data
        },
      },
    ])

    const result = await tasks.run()

    if (!result.deployedResult) {
      throw new Error(
        "Failed to deploy integration instance missing deployed result",
      )
    }

    return {
      success: true,
      name: "algolia",
      result: result.deployedResult.instance,
    }
  } catch (err: unknown) {
    listrLogger.log(
      "error",
      `An unknown error occurred: ${
        err instanceof Error
          ? `${err.name} = ${err.message}`
          : JSON.stringify(err)
      }`,
    )
    throw err
  } finally {
    unsubscribe.forEach((unsubFn) => unsubFn())
  }
}

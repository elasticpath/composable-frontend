import {
  deployIntegrationInstance,
  didRequestFail,
  performConnectionConfigAuthorisation,
} from "@elasticpath/composable-common"
import type { Instance } from "@elasticpath/composable-common"
import { createTRPCClient } from "../utility/integration-hub/create-trpc-client"
import { createApplicationKeys } from "../../../../util/create-client-secret"
import { ListrLogger, ListrTaskWrapper, ListrRendererFactory } from "listr2"
import { AlgoliaIntegrationTaskContext } from "../utility/algolia/types"
import { ListrLogLevels } from "listr2"

const listrLogger = new ListrLogger()

export async function setupAlgoliaIntegrationTasks(
  ctx: AlgoliaIntegrationTaskContext,
  taskWrapper: ListrTaskWrapper<
    AlgoliaIntegrationTaskContext,
    ListrRendererFactory,
    ListrRendererFactory
  >,
) {
  try {
    const { host: epccHost } = ctx.sourceInput

    return taskWrapper.newListr(
      [
        {
          title: "Create a dedicated api key for the integration",
          task: async (ctx) => {
            /**
             * Create a dedicated api key for the integration
             */
            const apiKeyResp = await createApplicationKeys(
              ctx.requester,
              `algolia-integration-${new Date().toISOString()}`,
            )

            if (didRequestFail(apiKeyResp)) {
              throw new Error(
                `Failed to create api key - ${apiKeyResp.error.message}`,
              )
            }

            const { client_id, client_secret } = apiKeyResp.data

            if (!client_secret) {
              throw new Error(
                "Failed to get client secret from api key response",
              )
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

            const createdInstanceResp =
              await tRPCClient.createIntegration.mutate({
                ...ctx.sourceInput,
                name: "algolia",
                epccConfig: {
                  host: epccHost,
                  clientId: createdCredentials.clientId,
                  clientSecret: createdCredentials.clientSecret,
                },
              })

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
            const createdInstance: Instance = (createdInstanceResp as any)
              .result
            listrLogger.log(
              ListrLogLevels.COMPLETED,
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
      ],
      {
        concurrent: false,
        exitOnError: true,
      },
    )
  } catch (err: unknown) {
    listrLogger.log(
      ListrLogLevels.FAILED,
      `An unknown error occurred: ${
        err instanceof Error
          ? `${err.name} = ${err.message}`
          : JSON.stringify(err)
      }`,
    )
    throw err
  }
}

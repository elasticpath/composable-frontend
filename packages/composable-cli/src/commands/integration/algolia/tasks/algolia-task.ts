import { AlgoliaIntegrationTaskContext } from "../utility/algolia/types"
import { switchUserStore } from "../../../../util/build-store-prompts"
import {
  ALGOLIA_INTEGRATION_NAME,
  createUrqlClient,
  didRequestFail,
  doesIntegrationInstanceExist,
  getUserInfo,
  integrationAuthToken,
  resolveRegion,
} from "@elasticpath/composable-common"
import { setupAlgoliaIntegrationTasks } from "./setup-algolia-integration-tasks"
import {
  buildCatalogPrompts,
  getActiveStoreCatalogs,
} from "../../../../lib/catalog/build-catalog-prompts"
import { ListrInquirerPromptAdapter } from "@listr2/prompt-adapter-inquirer"
import { select } from "@inquirer/prompts"
import { resolveIndexName } from "../utility/resolve-index-name"
import {
  getCatalogRelease,
  publishCatalog,
} from "../../../../lib/catalog/publish-catalog"
import { addToEnvFile } from "../../../../lib/devkit/add-env-variables"
import {
  additionalAlgoliaSetup,
  doesIndexExist,
} from "../utility/algolia/algolia"
import { ListrRendererFactory, ListrTaskWrapper } from "listr2/dist"

export function createAlgoliaTask({
  unsubscribe,
}: {
  unsubscribe: (() => void)[]
}) {
  return function InnerTaskFn<TContext extends AlgoliaIntegrationTaskContext>(
    _ctx: TContext,
    task: ListrTaskWrapper<
      TContext,
      ListrRendererFactory,
      ListrRendererFactory
    >,
  ) {
    return task.newListr(
      [
        {
          title: "Switching to active store",
          task: async (ctx) => {
            if (!ctx.config) {
              throw new Error("No config on context")
            }

            // Switch to the active store to make sure all access token operations are working against the correct store
            const switchStoreResult = await switchUserStore(
              ctx.requester,
              ctx.config.activeStore.id,
            )

            if (!switchStoreResult.success) {
              throw Error(
                `Failed to switch to active store - ${switchStoreResult.error.message}`,
              )
            }
          },
        },
        {
          title: "Get the integration hub auth token from Elastic Path",
          task: async (ctx) => {
            if (!ctx.config) {
              throw new Error("No config on context")
            }

            /**
             * Get the prismatic auth token from EPCC
             */
            const tokenResp = await integrationAuthToken(
              ctx.sourceInput.host,
              ctx.config.token,
            )

            if (didRequestFail(tokenResp)) {
              throw new Error(
                `Failed to get integration hub auth token - ${tokenResp.error.message}`,
              )
            }

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

            if (!ctx.sourceInput) {
              throw new Error("No source input on context")
            }

            const region = resolveRegion(ctx.sourceInput.host)

            const customerUrqlClient = createUrqlClient(ctx.ihToken, region)
            const { unsubscribe: debugUnsubscribe } =
              customerUrqlClient.subscribeToDebugTarget!((event) => {
                if (event.source === "dedupExchange") return
                const message = `[GraphQL client event][${event.type}][${event.operation.kind}][${event.operation.context.url}] ${event.message}`
                if (ctx.urqlDebugLogs) {
                  ctx.urqlDebugLogs.push(message)
                } else {
                  ctx.urqlDebugLogs = [message]
                }
              })
            unsubscribe = [...unsubscribe, debugUnsubscribe]

            ctx.customerUrqlClient = customerUrqlClient
          },
        },
        {
          title: "Get the user info for the customer",
          rendererOptions: {
            persistentOutput: true,
          },
          task: async (ctx, currentTask) => {
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

            currentTask.output = `Got customer id ${customerId}`
            ctx.customerId = customerId
          },
        },
        {
          title: "Check if instance exists on Elastic Path store",
          task: async (ctx, currentTask) => {
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

            if (doesExist) {
              currentTask.output = `${ALGOLIA_INTEGRATION_NAME} integration instance already exists.`
              ctx.instanceExists = true
            }
          },
          rendererOptions: {
            persistentOutput: true,
          },
        },
        {
          title: "Setup Algolia Integration",
          skip: (ctx) => !!ctx.instanceExists,
          task: setupAlgoliaIntegrationTasks,
          rendererOptions: { persistentOutput: true },
        },
        {
          title: "Publish Catalog",
          task: async (ctx, currentTask) => {
            const catalogsResult = await getActiveStoreCatalogs(ctx.requester)

            if (!catalogsResult.success) {
              throw Error(
                `Failed to fetch catalogs for active store - ${catalogsResult.error.message}`,
              )
            }

            const catalogs = catalogsResult.data

            if (catalogs.length < 1) {
              throw new Error(
                "The Algolia integration will only work correctly if you have a published catalog in your store. We were not able to find any catalogs in your store to publish. Please add a catalog and then rerun the `int algolia` command.\n\nLearn more about catalogs and publishing https://elasticpath.dev/docs/pxm/catalogs/catalogs",
              )
            }

            const catalogsPrompts = await buildCatalogPrompts(catalogs)

            if (!catalogsPrompts.success) {
              return {
                success: false,
                error: {
                  code: "FAILED_TO_BUILD_CATALOG_PROMPTS",
                  message: catalogsPrompts.error.message,
                },
              }
            }

            const catalog: any = await currentTask
              .prompt(ListrInquirerPromptAdapter)
              .run(select, {
                message: "Which catalog would you like to publish?",
                choices: catalogsPrompts.data,
              })

            currentTask.output = `Selected catalog ${catalog.attributes.name}`

            const algoliaIndexName = resolveIndexName(
              catalog.attributes.name,
              catalog.id,
            )

            // Assign selected catalog to context
            ctx.catalog = catalog
            ctx.algoliaIndexName = algoliaIndexName

            const publishResult = await publishCatalog(
              ctx.requester,
              catalog.id,
            )

            if (!publishResult.success) {
              throw new Error(
                `Failed to publish catalog - ${publishResult.error.message}`,
              )
            }

            let catalogStatus = publishResult.data.meta.release_status
            while (
              catalogStatus === "PENDING" ||
              catalogStatus === "IN_PROGRESS"
            ) {
              // Wait 3 seconds before checking the status again
              await timer(3000)
              const catalogStatusResult = await getCatalogRelease(
                ctx.requester,
                catalog.id,
                publishResult.data.id,
              )
              if (!catalogStatusResult.success) {
                throw new Error(
                  `Failed to get catalog status - ${catalogStatusResult.error.message}`,
                )
              }
              catalogStatus = catalogStatusResult.data.meta.release_status
            }

            if (catalogStatus === "FAILED") {
              throw new Error(
                `Failed to publish catalog - ${catalog.attributes.name} catalog`,
              )
            }
          },
        },
        {
          title: "Add index to .env.local file",
          task: async (ctx) => {
            const { catalog } = ctx

            if (!catalog) {
              throw new Error(
                "No catalog preset on context failed to add index to .env.local file.",
              )
            }

            const algoliaIndexName = resolveIndexName(
              catalog.attributes.name,
              catalog.id,
            )

            await addToEnvFile(ctx.workspaceRoot, ".env.local", {
              NEXT_PUBLIC_ALGOLIA_INDEX_NAME: algoliaIndexName,
            })
          },
        },
        {
          title: "Checking Algolia index exists",
          task: async (ctx, currentTask) => {
            const { catalog } = ctx
            if (!catalog) {
              throw new Error(
                "No catalog preset on context failed to check Algolia index exists.",
              )
            }
            const algoliaIndexName = resolveIndexName(
              catalog.attributes.name,
              catalog.id,
            )

            currentTask.output =
              "Depending on the size of the catalog that's been published it could take some time to index in Algolia."

            let runs = 0
            while (true) {
              runs++
              const indexCheckResult = await doesIndexExist({
                algoliaIndex: algoliaIndexName,
                algoliaAppId: ctx.sourceInput.appId,
                algoliaAdminKey: ctx.sourceInput.adminApiKey,
              })
              if (indexCheckResult) {
                break
              }

              if (runs > 60) {
                throw new Error(
                  "Timed out waiting for index to exist - took longer than 3 minutes",
                )
              }
              // Wait 3 seconds before checking the status again
              await timer(3000)
            }
          },
        },
        {
          title: "Additional Algolia setup",
          task: async (ctx) => {
            if (!ctx.algoliaIndexName) {
              throw new Error(
                "No algoliaIndexName preset on context failed to perform additional Algolia setup.",
              )
            }

            const additionalAlgoliaSetupResult = await additionalAlgoliaSetup({
              algoliaIndex: ctx.algoliaIndexName,
              algoliaAppId: ctx.sourceInput.appId,
              algoliaAdminKey: ctx.sourceInput.adminApiKey,
            })

            if (!additionalAlgoliaSetupResult.success) {
              throw new Error(
                `Failed to perform additional Algolia setup - ${additionalAlgoliaSetupResult.error?.message}`,
              )
            }
          },
        },
      ],
      {
        rendererOptions: {
          suffixSkips: true,
          collapseErrors: false,
        },
      },
    )
  }
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms))

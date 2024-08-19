import {
  ALGOLIA_INTEGRATION_NAME,
  doesIntegrationInstanceExist,
} from "@elasticpath/composable-common"
import {
  buildCatalogPrompts,
  getActiveStoreCatalogs,
} from "../../../../lib/catalog/build-catalog-prompts"
import { ListrInquirerPromptAdapter } from "@listr2/prompt-adapter-inquirer"
import { select } from "@inquirer/prompts"
import {
  getCatalogRelease,
  publishCatalog,
} from "../../../../lib/catalog/publish-catalog"
import { addToEnvFile } from "../../../../lib/devkit/add-env-variables"
import { ListrRendererFactory, ListrTaskWrapper } from "listr2/dist"
import { KlevuIntegrationTaskContext } from "../utility/types"
import {
  createCheckIfInstanceExistsTask,
  createCreateUrqlClientTask,
  createSwitchingToActiveStoreTask,
  getCustomerInfoTask,
  getIntegrationHubAuthTokenTask,
} from "../../utility/composer-tasks"
import { KLEVU_INTEGRATION_NAME } from "../utility/error-messages"

export function createKlevuTask({
  unsubscribe,
}: {
  unsubscribe: (() => void)[]
}) {
  return function InnerTaskFn<TContext extends KlevuIntegrationTaskContext>(
    _ctx: TContext,
    task: ListrTaskWrapper<
      TContext,
      ListrRendererFactory,
      ListrRendererFactory
    >,
  ) {
    return task.newListr(
      [
        // TODO add back tasks
        createSwitchingToActiveStoreTask(),
        getIntegrationHubAuthTokenTask(),
        createCreateUrqlClientTask({ unsubscribe }),
        getCustomerInfoTask(),
        createCheckIfInstanceExistsTask({
          integrationName: KLEVU_INTEGRATION_NAME,
        }),
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

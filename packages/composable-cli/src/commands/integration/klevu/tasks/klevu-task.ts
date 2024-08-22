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
import { ListrRendererFactory, ListrTaskWrapper } from "listr2/dist"
import { KlevuIntegrationTaskContext } from "../utility/types"
import {
  createCheckIfInstanceExistsTask,
  createCreateUrqlClientTask,
  createSwitchingToActiveStoreTask,
  getCustomerInfoTask,
  getIntegrationHubAuthTokenTask,
} from "../../shared/tasks/composer-tasks"
import { KLEVU_INTEGRATION_NAME } from "../utility/error-messages"
import { setupKlevuIntegrationTasks } from "./setup-klevu-integration-tasks"

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
        createSwitchingToActiveStoreTask<KlevuIntegrationTaskContext>(),
        getIntegrationHubAuthTokenTask<KlevuIntegrationTaskContext>(),
        createCreateUrqlClientTask<KlevuIntegrationTaskContext>({
          unsubscribe,
        }),
        getCustomerInfoTask<KlevuIntegrationTaskContext>(),
        createCheckIfInstanceExistsTask<KlevuIntegrationTaskContext>({
          integrationName: KLEVU_INTEGRATION_NAME,
        }),
        {
          title: "Setup Klevu Integration",
          skip: (ctx) => !!ctx.instanceExists,
          task: setupKlevuIntegrationTasks,
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
                "The Klevu integration will only work correctly if you have a published catalog in your store. We were not able to find any catalogs in your store to publish. Please add a catalog and then rerun the `int klevu` command.\n\nLearn more about catalogs and publishing https://elasticpath.dev/docs/pxm/catalogs/catalogs",
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

            // Assign selected catalog to context
            ctx.catalog = catalog

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

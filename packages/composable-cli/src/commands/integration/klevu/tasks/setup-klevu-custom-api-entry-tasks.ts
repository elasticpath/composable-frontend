import { ListrTaskWrapper, ListrRendererFactory } from "listr2"
import { KlevuIntegrationTaskContext } from "../utility/types"
import { ListrInquirerPromptAdapter } from "@listr2/prompt-adapter-inquirer"
import { select } from "@inquirer/prompts"
import {
  buildCatalogPrompts,
  getActiveStoreCatalogs,
} from "../../../../lib/catalog/build-catalog-prompts"
import { Catalog } from "@moltin/sdk"
import { fetchCustomApi } from "../utility/feat-custom-api"
import { backOff } from "exponential-backoff"
import { createCustomApiEntry } from "../utility/create-custom-api-entry"

export async function setupKlevuCustomApiEntryTasks(
  ctx: KlevuIntegrationTaskContext,
  taskWrapper: ListrTaskWrapper<
    KlevuIntegrationTaskContext,
    ListrRendererFactory,
    ListrRendererFactory
  >,
) {
  return taskWrapper.newListr(
    [
      {
        title: "Wait for Klevu integration to create custom api",
        task: async () => {
          // Wait for the klevu custom api to be created by the integration
          const customApi = await backOff(
            () => fetchCustomApi(ctx.requester, "klevu-keys"),
            {
              startingDelay: 2000,
              maxDelay: 60000,
              retry: (result) => {
                // Retry if the result is null
                return result === null
              },
            },
          )

          if (!customApi) {
            throw new Error(
              "Failed to create custom api entry for Klevu integration - timed out waiting for custom api to be created.",
            )
          }

          ctx.customApi = customApi
        },
      },
      {
        title: "Select a catalog to use for Klevu integration",
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

          const catalog = (await currentTask
            .prompt(ListrInquirerPromptAdapter)
            .run(select, {
              message: "Which catalog would you like to use with Klevu?",
              choices: catalogsPrompts.data,
            })) as Catalog

          currentTask.output = `Selected catalog ${catalog.attributes.name}`

          // Assign selected catalog to context
          ctx.catalog = catalog
        },
      },
      {
        title: "Create Klevu custom api entry",
        task: async (ctx, currentTask) => {
          if (!ctx.catalog) {
            throw new Error(
              "No catalog selected cannot create Klevu custom api entry",
            )
          }

          const body = {
            type: "klevu_keys_ext",
            slug: "klevu-keys",
            catalog_name: ctx.catalog.attributes.name,
            source_catalog_id: ctx.catalog.id,
            klevu_api_key: ctx.sourceInput.apiKey,
            klevu_rest_auth_key: ctx.sourceInput.restAuthKey,
          }

          await createCustomApiEntry(ctx.requester, body)
          currentTask.output = `Created custom api entry for Klevu integration`
        },
      },
    ],
    {
      concurrent: false,
      exitOnError: true,
    },
  )
}

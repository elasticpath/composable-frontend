import yargs from "yargs"
import {
  AlgoliaIntegrationCommandArguments,
  AlgoliaIntegrationCommandData,
  AlgoliaIntegrationCommandError,
} from "./algolia-integration.types"
import { CommandContext, CommandHandlerFunction } from "../../../types/command"
import { trackCommandHandler } from "../../../util/track-command-handler"
import {
  createActiveStoreMiddleware,
  createAuthenticationCheckerMiddleware,
} from "../../generate/generate-command"
import { IntegrationCommandArguments } from "../integration.types"
import { createConsoleLogger } from "@angular-devkit/core/node"
import * as ansiColors from "ansi-colors"
import { setupAlgoliaIntegration } from "./utility/integration-hub/setup-algolia-integration"
import inquirer from "inquirer"
import { isTTY } from "../../../util/is-tty"
import { getStore } from "../../../lib/stores/get-store"
import { switchUserStore } from "../../../util/build-store-prompts"
import { getToken } from "../../../lib/authentication/get-token"
import {
  getRegion,
  resolveHostFromRegion,
  resolveHostNameFromRegion,
} from "../../../util/resolve-region"
import { resolveEPCCErrorMessage } from "../../../util/epcc-error"
import Conf from "conf"
import { Result } from "../../../types/results"
import { UserStore } from "../../../lib/stores/stores-schema"
import { Region } from "../../../lib/stores/region-schema"
import {
  AlgoliaIntegrationSetup,
  algoliaIntegrationSetupSchema,
} from "./utility/integration-hub/setup-algolia-schema"
import boxen from "boxen"
import {
  buildCatalogPrompts,
  getActiveStoreCatalogs,
} from "../../../lib/catalog/build-catalog-prompts"
import {
  getCatalogRelease,
  publishCatalog,
} from "../../../lib/catalog/publish-catalog"
import ora from "ora"
import {
  additionalAlgoliaSetup,
  doesIndexExist,
} from "./utility/algolia/algolia"
import { logging } from "@angular-devkit/core"
import { addToEnvFile } from "../../../lib/devkit/add-env-variables"
import { resolveIndexName } from "./utility/resolve-index-name"
import { Listr, ListrLogger } from "listr2"
import { ListrInquirerPromptAdapter } from "@listr2/prompt-adapter-inquirer"
import { select } from "@inquirer/prompts"
import { AlgoliaIntegrationTaskContext } from "./utility/algolia/types"

export function createAlgoliaIntegrationCommand(
  ctx: CommandContext,
): yargs.CommandModule<
  IntegrationCommandArguments,
  AlgoliaIntegrationCommandArguments
> {
  return {
    command: "algolia",
    describe:
      "setup Algolia integration for your Elastic Path powered storefront",
    builder: async (yargs) => {
      return yargs
        .middleware(createAuthenticationCheckerMiddleware(ctx))
        .middleware(createActiveStoreMiddleware(ctx))
        .option("algolia-application-id", {
          type: "string",
          description: "Algolia App ID",
        })
        .option("algolia-admin-api-key", {
          type: "string",
          description: "Algolia Admin API Key",
        })
        .fail(false)
        .help()
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createAlgoliaIntegrationCommandHandler),
    ),
  }
}

const listrLogger = new ListrLogger()

export function createAlgoliaIntegrationCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  AlgoliaIntegrationCommandData,
  AlgoliaIntegrationCommandError,
  AlgoliaIntegrationCommandArguments
> {
  return async function algoliaIntegrationCommandHandler(args) {
    const colors = ansiColors.create()
    const logger = createConsoleLogger(!!args.verbose, ctx.stdout, ctx.stderr, {
      info: (s) => s,
      debug: (s) => s,
      warn: (s) => colors.bold.yellow(s),
      error: (s) => colors.bold.red(s),
      fatal: (s) => colors.bold.red(s),
    })

    const { workspaceRoot, requester } = ctx

    if (!workspaceRoot) {
      throw new Error(
        "Workspace root not found unable to setup algolia integration.",
      )
    }

    try {
      // Switch to the active store to make sure all access token operations are working against the correct store
      const { store } = ctx
      const confData = await resolveConfStoreData(store)

      if (!confData.success) {
        return {
          success: false,
          error: {
            code: "FAILED_TO_RESOLVE_STORE_DATA",
            message: confData.error.message,
          },
        }
      }

      const { token, activeStore, region } = confData.data

      const options = await resolveOptions(
        resolveHostNameFromRegion(region),
        token,
        args,
        logger,
        colors,
      )

      const tasks = new Listr<AlgoliaIntegrationTaskContext>([
        {
          title: "Switching to active store",
          task: async () => {
            const switchStoreResult = await switchUserStore(
              ctx.requester,
              activeStore.id,
            )

            if (!switchStoreResult.success) {
              throw Error(
                `Failed to switch to active store - ${switchStoreResult.error.message}`,
              )
            }
          },
        },
        {
          title: "Setup Algolia Integration",
          task: async (ctx, parentTask) => {
            const result = await setupAlgoliaIntegration(
              options,
              ctx.requester,
              parentTask,
            )

            if (!result.success) {
              throw Error(
                `Failed to setup Algolia integration - ${result.reason}`,
              )
            }
          },
        },
        {
          title: "Publish Catalog",
          task: async (ctx, parentTask) => {
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

            const catalog: any = await parentTask
              .prompt(ListrInquirerPromptAdapter)
              .run(select, {
                message: "Which catalog would you like to publish?",
                choices: catalogsPrompts.data,
              })

            listrLogger.log(
              "info",
              `Selected catalog ${catalog.attributes.name}`,
            )

            const algoliaIndexName = resolveIndexName(
              catalog.attributes.name,
              catalog.id,
            )

            // Assign selected catalog to context
            ctx.catalog = catalog
            ctx.algoliaIndexName = algoliaIndexName
            // await inquirer.prompt([
            //   {
            //     type: "list",
            //     name: "catalog",
            //     message: "Which catalog would you like to publish?",
            //     choices: catalogsPrompts.data,
            //   },
            // ])

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

            // logger.info(
            //   boxen(
            //     `Published catalog should have an Algolia index of ${colors.bold.green(
            //       algoliaIndexName,
            //     )}\nDepending on the size of the catalog that's been published it could take some time to index in Algolia.`,
            //     {
            //       padding: 1,
            //       margin: 1,
            //     },
            //   ),
            // )
          },
        },
        {
          title: "Checking Algolia index exists",
          task: async (ctx) => {
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

            // TODO: add timeout to waiting for index to exist
            while (true) {
              const indexCheckResult = await doesIndexExist({
                algoliaIndex: algoliaIndexName,
                algoliaAppId: options.appId,
                algoliaAdminKey: options.adminApiKey,
              })
              if (indexCheckResult) {
                break
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
              algoliaAppId: options.appId,
              algoliaAdminKey: options.adminApiKey,
              spinner: ora(),
            })

            if (!additionalAlgoliaSetupResult.success) {
              throw new Error(
                `Failed to perform additional Algolia setup - ${additionalAlgoliaSetupResult.error?.message}`,
              )
            }
          },
        },
      ])

      const result = await tasks.run({
        requester,
        workspaceRoot,
      })

      return {
        success: true,
        data: {
          indexName: result.algoliaIndexName,
        },
      }
    } catch (e) {
      return {
        success: false,
        error: {
          code: "ALGOLIA_INTEGRATION_SETUP_FAILED",
          message: "Failed to setup Algolia integration",
        },
      }
    }
  }
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms))

async function resolveConfStoreData(
  store: Conf,
): Promise<
  Result<
    { activeStore: UserStore; apiUrl: string; token: string; region: Region },
    AlgoliaIntegrationCommandError
  >
> {
  const activeStoreResult = await getStore(store)

  if (!activeStoreResult.success) {
    return {
      success: false,
      error: {
        code: "NO_ACTIVE_STORE",
        message: "No active store selected",
      },
    }
  }

  const regionResult = getRegion(store)

  if (!regionResult.success) {
    return {
      success: false,
      error: {
        code: "NO_REGION_FOUND",
        message: regionResult.error.message,
      },
    }
  }

  const region = regionResult.data

  const apiUrl = resolveHostFromRegion(region)

  const tokenResult = await getToken(apiUrl, store)

  if (!tokenResult.success) {
    return {
      success: false,
      error: {
        code: "NO_ACCESS_TOKEN",
        message:
          tokenResult.error instanceof Error
            ? tokenResult.error.message
            : resolveEPCCErrorMessage(tokenResult.error.errors),
      },
    }
  }

  return {
    success: true,
    data: {
      activeStore: activeStoreResult.data,
      apiUrl,
      region,
      token: tokenResult.data,
    },
  }
}

async function resolveOptions(
  host: string,
  accessToken: string,
  args: AlgoliaIntegrationCommandArguments,
  logger: logging.Logger,
  colors: typeof ansiColors,
): Promise<AlgoliaIntegrationSetup> {
  if (args.interactive && isTTY()) {
    return algoliaOptionsPrompts(host, accessToken, args, logger, colors)
  }

  const formattedArgs = {
    appId: args.algoliaApplicationId,
    adminApiKey: args.algoliaAdminApiKey,
    epccConfig: {
      host,
      accessToken,
    },
  }

  const parsed = algoliaIntegrationSetupSchema.safeParse(formattedArgs)

  if (!parsed.success) {
    throw new Error(`Invalid arguments: ${JSON.stringify(parsed.error)}`)
  }

  return parsed.data
}

async function algoliaOptionsPrompts(
  host: string,
  accessToken: string,
  args: AlgoliaIntegrationCommandArguments,
  logger: logging.Logger,
  colors: typeof ansiColors,
): Promise<AlgoliaIntegrationSetup> {
  const { algoliaAdminApiKey: argsAdminKey, algoliaApplicationId: argsAppId } =
    args

  if (!argsAppId && !argsAdminKey) {
    logger.info(
      boxen(
        `You can find your ${colors.bold.green(
          "Algolia App ID",
        )} and ${colors.bold.green(
          "Admin API Key",
        )} in your Algolia dashboard.\nhttps://dashboard.algolia.com/account/api-keys/all`,
        {
          padding: 1,
          margin: 1,
        },
      ),
    )
  }

  let gatheredOptions = {}

  if (!argsAppId) {
    const { algoliaApplicationId } = await inquirer.prompt([
      {
        type: "string",
        name: "algoliaApplicationId",
        message: "What is your Algolia App ID?",
      },
    ])

    gatheredOptions = {
      ...gatheredOptions,
      appId: algoliaApplicationId,
    }
  } else {
    gatheredOptions = {
      ...gatheredOptions,
      appId: argsAppId,
    }
  }

  if (!argsAdminKey) {
    const { algoliaAdminApiKey } = await inquirer.prompt([
      {
        type: "password",
        name: "algoliaAdminApiKey",
        message: "What is your Algolia Admin API Key?",
        mask: "*",
      },
    ])

    gatheredOptions = {
      ...gatheredOptions,
      adminApiKey: algoliaAdminApiKey,
    }
  } else {
    gatheredOptions = {
      ...gatheredOptions,
      adminApiKey: argsAdminKey,
    }
  }

  return {
    ...(gatheredOptions as { appId: string; adminApiKey: string }),
    host,
    accessToken,
  }
}

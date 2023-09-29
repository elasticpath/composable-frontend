import yargs from "yargs"
import {
  AlgoliaIntegrationCommandArguments,
  AlgoliaIntegrationCommandData,
  AlgoliaIntegrationCommandError,
} from "./algolia-integration.types"
import { CommandContext, CommandHandlerFunction } from "../../../types/command"
import { handleErrors } from "../../../util/error-handler"
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
import { StoreCatalog } from "../../../lib/catalog/catalog-schema"
import ora from "ora"
import {
  additionalAlgoliaSetup,
  doesIndexExist,
} from "./utility/algolia/algolia"
import { logging } from "@angular-devkit/core"
import { attemptToAddEnvVariables } from "../../../lib/devkit/add-env-variables"

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
    handler: handleErrors(
      trackCommandHandler(ctx, createAlgoliaIntegrationCommandHandler),
    ),
  }
}

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

    const spinner = ora()

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

      const switchStoreResult = await switchUserStore(
        ctx.requester,
        activeStore.id,
      )

      if (!switchStoreResult.success) {
        return {
          success: false,
          error: {
            code: "FAILED_TO_SWITCH_STORE",
            message: switchStoreResult.error.message,
          },
        }
      }

      const options = await resolveOptions(
        resolveHostNameFromRegion(region),
        token,
        args,
        logger,
        colors,
      )

      const result = await setupAlgoliaIntegration(
        options,
        ctx.requester,
        logger,
      )

      if (!result.success) {
        return {
          success: false,
          error: {
            code: "ALGOLIA_INTEGRATION_SETUP_FAILED",
            message: "Failed to setup Algolia integration",
          },
        }
      }

      logger.info(
        boxen(
          `${colors.bold.green(
            "Don't forget to publish your catalog...",
          )}\nIn order to see the Algolia integration in action you will need to publish a catalog.`,
          {
            padding: 1,
            margin: 1,
          },
        ),
      )

      const { publish } = await inquirer.prompt([
        {
          type: "confirm",
          name: "publish",
          message: "Would you like to publish a catalog to Algolia?",
          default: true,
        },
      ])

      if (!publish) {
        return {
          success: true,
          data: {},
        }
      }

      const catalogsResult = await getActiveStoreCatalogs(ctx.requester)

      if (!catalogsResult.success) {
        logger.error("Failed to fetch catalogs for active store")
        return {
          success: false,
          error: {
            code: "FAILED_TO_FETCH_CATALOGS",
            message: "Failed to fetch catalogs for active store",
          },
        }
      }

      const catalogs = catalogsResult.data

      if (catalogs.length < 1) {
        logger.warn(
          boxen(
            "The Algolia integration will only work correctly if you have a published catalog in your store. We were not able to find any catalogs in your store to publish. Please add a catalog and then rerun the `int algolia` command.\n\nLearn more about catalogs and publishing https://elasticpath.dev/docs/pxm/catalogs/catalogs",
            {
              padding: 1,
              margin: 1,
            },
          ),
        )
        return {
          success: false,
          error: {
            code: "FAILED_TO_FIND_ANY_CATALOGS",
            message: "There were not catalogs in the store",
          },
        }
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

      const { catalog }: { catalog: StoreCatalog } = await inquirer.prompt([
        {
          type: "list",
          name: "catalog",
          message: "Which catalog would you like to publish?",
          choices: catalogsPrompts.data,
        },
      ])

      spinner.start(`Publishing ${catalog.attributes.name} catalog...`)
      const publishResult = await publishCatalog(ctx.requester, catalog.id)

      if (!publishResult.success) {
        spinner.fail(`Failed to publish ${catalog.attributes.name} catalog`)
        return {
          success: false,
          error: {
            code: "FAILED_TO_PUBLISH_CATALOG",
            message: publishResult.error.message,
          },
        }
      }

      spinner.text = `waiting for catalog to finish publishing...`

      let catalogStatus = publishResult.data.meta.release_status
      while (catalogStatus === "PENDING") {
        // Wait 3 seconds before checking the status again
        await timer(3000)
        const catalogStatusResult = await getCatalogRelease(
          ctx.requester,
          catalog.id,
          publishResult.data.id,
        )
        if (!catalogStatusResult.success) {
          spinner.fail(`Failed to get catalog status`)
          return {
            success: false,
            error: {
              code: "FAILED_TO_GET_CATALOG_STATUS",
              message: catalogStatusResult.error.message,
            },
          }
        }
        catalogStatus = catalogStatusResult.data.meta.release_status
      }

      if (catalogStatus === "FAILED") {
        spinner.fail(`Failed to publish ${catalog.attributes.name} catalog`)
        return {
          success: false,
          error: {
            code: "FAILED_TO_PUBLISH_CATALOG",
            message: `Failed to publish ${catalog.attributes.name} catalog`,
          },
        }
      }

      spinner.succeed(`Published ${catalog.attributes.name} catalog!`)

      const algoliaIndexName = `${catalog.attributes.name.replace(" ", "_")}_${
        catalog.id.split("-")[0]
      }`

      const envVarResult = await attemptToAddEnvVariables(ctx, spinner, {
        NEXT_PUBLIC_ALGOLIA_INDEX_NAME: algoliaIndexName,
      })

      if (!envVarResult.success) {
        return {
          success: false,
          error: envVarResult.error,
        }
      }

      logger.info(
        boxen(
          `Published catalog should have an Algolia index of ${colors.bold.green(
            algoliaIndexName,
          )}\nDepending on the size of the catalog that's been published it could take some time to index in Algolia.`,
          {
            padding: 1,
            margin: 1,
          },
        ),
      )

      spinner.start(`Checking Algolia index exists...`)
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

      spinner.text = `Found index ${algoliaIndexName} performing additional setup...`

      const additionalAlgoliaSetupResult = await additionalAlgoliaSetup({
        algoliaIndex: algoliaIndexName,
        algoliaAppId: options.appId,
        algoliaAdminKey: options.adminApiKey,
        spinner,
      })

      if (!additionalAlgoliaSetupResult.success) {
        return {
          success: false,
          error: {
            code: "FAILED_TO_PERFORM_ADDITIONAL_SETUP_ALGOLIA_INDEX",
            message: additionalAlgoliaSetupResult.reason,
          },
        }
      }

      spinner.succeed(`Algolia Integration setup complete!`)

      return {
        success: true,
        data: {
          indexName: algoliaIndexName,
        },
      }
    } catch (e) {
      spinner.fail(`Failed to setup Algolia integration`)
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

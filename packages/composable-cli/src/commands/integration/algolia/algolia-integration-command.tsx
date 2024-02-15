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
import * as ansiColors from "ansi-colors"
import inquirer from "inquirer"
import { isTTY } from "../../../util/is-tty"
import { getStore } from "../../../lib/stores/get-store"
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
import { createAlgoliaTask } from "./tasks/algolia-task"
import { Listr } from "listr2"
import { AlgoliaIntegrationTaskContext } from "./utility/algolia/types"
import { renderInfo } from "../../ui"
import { outputContent, outputToken } from "../../output"
import { addToEnvFile } from "../../../lib/devkit/add-env-variables"

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
        .option("algolia-search-api-key", {
          type: "string",
          description: "Algolia Search Only API Key",
        })
        .fail(false)
        .help()
    },
    handler: ctx.handleErrors(
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

    const { workspaceRoot, requester } = ctx

    if (!workspaceRoot) {
      throw new Error(
        "Workspace root not found unable to setup algolia integration.",
      )
    }

    let unsubscribe: (() => void)[] = []

    try {
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

      const { token, region } = confData.data

      const options = await resolveOptions(
        resolveHostNameFromRegion(region),
        token,
        args,
        colors,
      )

      const tasks = new Listr<AlgoliaIntegrationTaskContext>([
        {
          title: "Setup Algolia integration",
          task: createAlgoliaTask({ unsubscribe }),
        },
        {
          title: "Update environment files with latest keys",
          task: async (ctx) => {
            const { workspaceRoot } = ctx

            const envVariables = {
              NEXT_PUBLIC_ALGOLIA_API_KEY: options.searchApiKey,
              NEXT_PUBLIC_ALGOLIA_APP_ID: options.appId,
            }

            await addToEnvFile(workspaceRoot, ".env.local", envVariables)
            await addToEnvFile(workspaceRoot, ".env.test", envVariables)
          },
        },
      ])

      const result = await tasks.run({
        requester,
        workspaceRoot,
        sourceInput: options,
        config: confData.data,
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
    } finally {
      unsubscribe.forEach((unsubFn) => unsubFn())
    }
  }
}

export async function resolveConfStoreData(
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

export async function resolveOptions(
  host: string,
  accessToken: string,
  args: AlgoliaIntegrationCommandArguments,
  colors: typeof ansiColors,
): Promise<AlgoliaIntegrationSetup> {
  if (args.interactive && isTTY()) {
    return algoliaOptionsPrompts(host, accessToken, args, colors)
  }

  const formattedArgs = {
    appId: args.algoliaApplicationId,
    adminApiKey: args.algoliaAdminApiKey,
    searchApiKey: args.algoliaSearchApiKey,
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
  colors: typeof ansiColors,
): Promise<AlgoliaIntegrationSetup> {
  const {
    algoliaAdminApiKey: argsAdminKey,
    algoliaApplicationId: argsAppId,
    algoliaSearchApiKey: argsSearchKey,
  } = args

  if (!argsAppId && !argsAdminKey) {
    renderInfo({
      headline: "Algolia keys",
      body: outputContent`You can find your ${colors.bold.green(
        "Algolia App ID",
      )} and ${colors.bold.green(
        "Admin API Key",
      )} in your Algolia dashboard.\n\n${outputToken.link(
        "Algolia Dashboard",
        "https://dashboard.algolia.com/account/api-keys/all",
      )}`.value,
    })
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

  if (!argsSearchKey) {
    const { algoliaSearchApiKey } = await inquirer.prompt([
      {
        type: "string",
        name: "algoliaSearchApiKey",
        message: "What is your Algolia Search Only API Key?",
      },
    ])

    gatheredOptions = {
      ...gatheredOptions,
      searchApiKey: algoliaSearchApiKey,
    }
  } else {
    gatheredOptions = {
      ...gatheredOptions,
      searchApiKey: argsSearchKey,
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
    ...(gatheredOptions as {
      appId: string
      adminApiKey: string
      searchApiKey: string
    }),
    host,
    accessToken,
  }
}

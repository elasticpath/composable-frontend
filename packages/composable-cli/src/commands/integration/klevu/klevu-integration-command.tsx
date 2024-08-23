import yargs from "yargs"
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
import { Listr } from "listr2"
import { renderInfo } from "../../ui"
import { outputContent, outputToken } from "../../output"
import { addToEnvFile } from "../../../lib/devkit/add-env-variables"
import {
  KlevuIntegrationCommandArguments,
  KlevuIntegrationCommandData,
  KlevuIntegrationCommandError,
} from "./klevu-integration.types"
import { createKlevuTask } from "./tasks/klevu-task"
import {
  KlevuIntegrationSetup,
  klevuIntegrationSetupSchema,
} from "./utility/integration-hub/setup-klevu-schema"
import { KlevuIntegrationTaskContext } from "./utility/types"

export function createKlevuIntegrationCommand(
  ctx: CommandContext,
): yargs.CommandModule<
  IntegrationCommandArguments,
  KlevuIntegrationCommandArguments
> {
  return {
    command: "klevu",
    describe:
      "setup Klevu integration for your Elastic Path powered storefront",
    builder: async (yargs) => {
      return yargs
        .middleware(createAuthenticationCheckerMiddleware(ctx))
        .middleware(createActiveStoreMiddleware(ctx))
        .option("klevu-api-key", {
          type: "string",
          description: "Klevu api key",
        })
        .option("klevu-search-url", {
          type: "string",
          description: "Klevu Cloud Search Url",
        })
        .option("klevu-rest-auth-key", {
          type: "string",
          description: "Klevu rest auth key",
        })
        .fail(false)
        .help()
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createKlevuIntegrationCommandHandler),
    ),
  }
}

export function createKlevuIntegrationCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  KlevuIntegrationCommandData,
  KlevuIntegrationCommandError,
  KlevuIntegrationCommandArguments
> {
  return async function klevuIntegrationCommandHandler(args) {
    const colors = ansiColors.create()

    const { workspaceRoot, requester } = ctx

    if (!workspaceRoot) {
      throw new Error(
        "Workspace root not found unable to setup Klevu integration.",
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

      const tasks = new Listr<KlevuIntegrationTaskContext>([
        {
          title: "Setup Klevu integration",
          task: createKlevuTask({ unsubscribe }),
        },
        {
          title: "Update environment files with latest keys",
          task: async (ctx) => {
            const { workspaceRoot } = ctx

            const envVariables = {
              NEXT_PUBLIC_KLEVU_API_KEY: options.apiKey,
              NEXT_PUBLIC_KLEVU_SEARCH_URL: options.searchUrl,
            }

            await addToEnvFile(workspaceRoot, ".env.local", envVariables)
            await addToEnvFile(workspaceRoot, ".env.test", envVariables)
          },
        },
      ])

      await tasks.run({
        requester,
        workspaceRoot,
        sourceInput: options,
        config: confData.data,
      })

      return {
        success: true,
        data: {},
      }
    } catch (e) {
      return {
        success: false,
        error: {
          code: "KLEVU_INTEGRATION_SETUP_FAILED",
          message: "Failed to setup Klevu integration",
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
    KlevuIntegrationCommandError
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
  args: KlevuIntegrationCommandArguments,
  colors: typeof ansiColors,
): Promise<KlevuIntegrationSetup> {
  if (args.interactive && isTTY()) {
    return klevuOptionsPrompts(host, accessToken, args, colors)
  }

  const formattedArgs = {
    apiKey: args.klevuApiKey,
    searchUrl: args.klevuSearchUrl,
    restAuthKey: args.klevuRestAuthKey,
    epccConfig: {
      host,
      accessToken,
    },
  }

  const parsed = klevuIntegrationSetupSchema.safeParse(formattedArgs)

  if (!parsed.success) {
    throw new Error(`Invalid arguments: ${JSON.stringify(parsed.error)}`)
  }

  return parsed.data
}

async function klevuOptionsPrompts(
  host: string,
  accessToken: string,
  args: KlevuIntegrationCommandArguments,
  colors: typeof ansiColors,
): Promise<KlevuIntegrationSetup> {
  const {
    klevuApiKey: argsApiKey,
    klevuSearchUrl: argsSearchUrl,
    klevuRestAuthKey: argsRestAuthKey,
  } = args

  if (!argsApiKey && !argsSearchUrl) {
    renderInfo({
      headline: "Klevu keys",
      body: outputContent`You can find your ${colors.bold.green(
        "Api key",
      )} and ${colors.bold.green(
        "Search url",
      )} in your Klevu dashboard.\n\n${outputToken.link(
        "Klevu Dashboard",
        "https://box.klevu.com/merchant/stores-and-sync#storeList",
      )}`.value,
    })
  }

  let gatheredOptions = {}

  if (!argsApiKey) {
    const { klevuApiKey } = await inquirer.prompt([
      {
        type: "string",
        name: "klevuApiKey",
        message: "What is your Klevu Api key?",
      },
    ])

    gatheredOptions = {
      ...gatheredOptions,
      apiKey: klevuApiKey,
    }
  } else {
    gatheredOptions = {
      ...gatheredOptions,
      apiKey: argsApiKey,
    }
  }

  if (!argsSearchUrl) {
    const { klevuSearchUrl } = await inquirer.prompt([
      {
        type: "string",
        name: "klevuSearchUrl",
        message: "What is your Klevu search url?",
      },
    ])

    gatheredOptions = {
      ...gatheredOptions,
      searchUrl: klevuSearchUrl,
    }
  } else {
    gatheredOptions = {
      ...gatheredOptions,
      searchUrl: argsSearchUrl,
    }
  }

  if (!argsRestAuthKey) {
    const { klevuRestAuthKey } = await inquirer.prompt([
      {
        type: "string",
        name: "klevuRestAuthKey",
        message: "What is your Klevu rest auth key?",
      },
    ])

    gatheredOptions = {
      ...gatheredOptions,
      restAuthKey: klevuRestAuthKey,
    }
  } else {
    gatheredOptions = {
      ...gatheredOptions,
      restAuthKey: argsRestAuthKey,
    }
  }

  return {
    ...(gatheredOptions as KlevuIntegrationSetup),
    host,
    accessToken,
  }
}

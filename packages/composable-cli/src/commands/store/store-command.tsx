import yargs from "yargs"
import Conf from "conf"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import { handleErrors } from "../../util/error-handler"
import {
  SetStoreCommandArguments,
  SetStoreCommandData,
  SetStoreCommandError,
  StoreCommandArguments,
  StoreCommandData,
  StoreCommandError,
} from "./store.types"
import { getCredentials } from "../../lib/authentication/get-token"
import {
  buildStorePrompts,
  fetchStore,
  switchUserStore,
} from "../../util/build-store-prompts"
import inquirer from "inquirer"
import { createAuthenticationMiddleware } from "../login/login-command"
import { userStoreResponseSchema } from "../../lib/stores/stores-schema"
import { Result } from "../../types/results"
import {
  checkIsErrorResponse,
  resolveEPCCErrorMessage,
} from "../../util/epcc-error"
import { trackCommandHandler } from "../../util/track-command-handler"
import { EpccRequester } from "../../util/command"
import { storeUserStore } from "../../util/conf-store/store-credentials"

export function createStoreCommand(
  ctx: CommandContext,
): yargs.CommandModule<RootCommandArguments, StoreCommandArguments> {
  return {
    command: "store",
    describe: "interact with Elasticpath store",
    builder: (yargs) => {
      return yargs
        .middleware(createAuthenticationMiddleware(ctx))
        .command(createSetStoreCommand(ctx))
        .fail(false)
        .help("h")
        .demandCommand(1)
        .strict()
    },
    handler: handleErrors(trackCommandHandler(ctx, createStoreCommandHandler)),
  }
}

export function createSetStoreCommand(
  ctx: CommandContext,
): yargs.CommandModule<StoreCommandArguments, SetStoreCommandArguments> {
  return {
    command: "set",
    describe: "Set active store",
    builder: (yargs) => {
      return yargs
        .option("id", {
          type: "string",
          description: "Id of Elastic Path store to set as active",
        })
        .help()
    },
    handler: handleErrors(
      trackCommandHandler(ctx, createSetStoreCommandHandler),
    ),
  }
}

export function createSetStoreCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  SetStoreCommandData,
  SetStoreCommandError,
  SetStoreCommandArguments
> {
  return async function storeCommandHandler(args) {
    if (args.id) {
      const selectResult = await selectStoreById(
        ctx.store,
        ctx.requester,
        args.id,
      )

      if (!selectResult.success) {
        return {
          success: false,
          error: {
            code: "failed-set-store",
            message: `Failed to set store: ${selectResult.error.message}`,
          },
        }
      }

      return {
        success: true,
        data: {},
      }
    }

    const selectResult = await storeSelectPrompt(ctx.store, ctx.requester)

    if (!selectResult.success) {
      return {
        success: false,
        error: {
          code: "failed-set-store",
          message: `Failed to set store: ${selectResult.error.message}`,
        },
      }
    }

    return {
      success: true,
      data: {},
    }
  }
}

export function createStoreCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  StoreCommandData,
  StoreCommandError,
  StoreCommandArguments
> {
  return async function storeCommandHandler(_args) {
    ctx.logger.warn("command not recognized")
    return {
      success: false,
      error: {
        code: "command_not_recognized",
        message: "command not recognized",
      },
    }
  }
}

export async function selectStoreById(
  store: Conf,
  requester: EpccRequester,
  id: string,
): Promise<Result<{}, Error>> {
  const credentialsResult = getCredentials(store)

  if (!credentialsResult.success) {
    console.error("Not authenticated: ", credentialsResult.error)
    return {
      success: false,
      error: new Error("Not authenticated"),
    }
  }

  const storeResponse = await fetchStore(requester, id)

  const parsedResponse = userStoreResponseSchema.safeParse(storeResponse)

  // Handle parsing errors
  if (!parsedResponse.success) {
    return {
      success: false,
      error: new Error(parsedResponse.error.message),
    }
  }

  if (checkIsErrorResponse(parsedResponse.data)) {
    return {
      success: false,
      error: new Error(resolveEPCCErrorMessage(parsedResponse.data.errors)),
    }
  }

  const { data: parsedResultData } = parsedResponse.data

  const switchStoreResult = await switchUserStore(requester, id)

  if (!switchStoreResult.success) {
    return {
      success: false,
      error: new Error(switchStoreResult.error.message),
    }
  }

  storeUserStore(store, parsedResultData)

  return {
    success: true,
    data: {},
  }
}

export async function storeSelectPrompt(
  store: Conf,
  requester: EpccRequester,
): Promise<Result<{}, Error>> {
  const credentialsResult = getCredentials(store)

  if (!credentialsResult.success) {
    console.error("Not authenticated: ", credentialsResult.error)
    return {
      success: false,
      error: new Error("Not authenticated"),
    }
  }

  const choicesResult = await buildStorePrompts(requester)

  if (!choicesResult.success) {
    console.error(choicesResult.error)
    return {
      success: false,
      error: new Error(choicesResult.error.message),
    }
  }

  const answers = await inquirer.prompt([
    {
      type: "list",
      loop: false,
      name: "store",
      message: "Which store do you want to use?",
      choices: choicesResult.data,
    },
  ])

  const switchResult = await switchUserStore(requester, answers.store.id)

  if (!switchResult.success) {
    return {
      success: false,
      error: new Error(switchResult.error.message),
    }
  }

  storeUserStore(store, answers.store)

  return {
    success: true,
    data: {},
  }
}

import yargs from "yargs"
import Conf from "conf"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import { handleErrors } from "../../util/error-handler"
import {
  SetStoreCommandArguments,
  SetStoreCommandData,
  SetStoreCommandError,
  StoreCommandArguments,
  StoreCommandData,
  StoreCommandError,
} from "./store.types"
import { resolveHostFromRegion } from "../../util/resolve-region"
import { getToken } from "../../lib/authentication/get-token"
import {
  buildStorePrompts,
  fetchStore,
  switchUserStore,
} from "../../util/build-store-prompts"
import inquirer from "inquirer"
import { createAuthenticationMiddleware } from "../login/login-command"
import { userStoreResponseSchema } from "../../lib/stores/stores-schema"
import { Result } from "../../types/results"

export function createStoreCommand(
  ctx: CommandContext
): yargs.CommandModule<{}, StoreCommandArguments> {
  return {
    command: "store",
    describe: "interact with Elasticpath store",
    builder: (yargs) => {
      return yargs
        .middleware(createAuthenticationMiddleware(ctx))
        .command(createSetStoreCommand(ctx))
        .help("h")
    },
    handler: handleErrors(createStoreCommandHandler(ctx)),
  }
}

export function createSetStoreCommand(
  ctx: CommandContext
): yargs.CommandModule<{}, SetStoreCommandArguments> {
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
    handler: handleErrors(createSetStoreCommandHandler(ctx)),
  }
}

export function createSetStoreCommandHandler(
  ctx: CommandContext
): CommandHandlerFunction<
  SetStoreCommandData,
  SetStoreCommandError,
  SetStoreCommandArguments
> {
  return async function storeCommandHandler(args) {
    if (args.id) {
      const selectResult = await selectStoreById(ctx.store, args.id)

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

    const selectResult = await storeSelectPrompt(ctx.store)

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
  _ctx: CommandContext
): CommandHandlerFunction<
  StoreCommandData,
  StoreCommandError,
  StoreCommandArguments
> {
  return async function storeCommandHandler(_args) {
    console.log("command not recognized")
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
  id: string
): Promise<Result<{}, Error>> {
  const apiUrl = resolveHostFromRegion(store.get("region") as any)
  const tokenResult = await getToken(apiUrl, store)

  if (!tokenResult.success) {
    console.error("Not authenticated: ", tokenResult.error)
    return {
      success: false,
      error: new Error("Not authenticated"),
    }
  }

  const { data: token } = tokenResult

  const storeResponse = await fetchStore(apiUrl, token, id)

  const parsedResponse = userStoreResponseSchema.safeParse(storeResponse)

  // Handle parsing errors
  if (!parsedResponse.success) {
    return {
      success: false,
      error: new Error(parsedResponse.error.message),
    }
  }

  const { data: parsedResultData } = parsedResponse

  const switchStoreResult = await switchUserStore(apiUrl, token, id)

  if (!switchStoreResult.success) {
    return {
      success: false,
      error: new Error(switchStoreResult.error.message),
    }
  }

  store.set("store", parsedResultData)

  return {
    success: true,
    data: {},
  }
}

export async function storeSelectPrompt(
  store: Conf
): Promise<Result<{}, Error>> {
  const apiUrl = resolveHostFromRegion(store.get("region") as any)
  const tokenResult = await getToken(apiUrl, store)

  if (!tokenResult.success) {
    console.error("Not authenticated: ", tokenResult.error)
    return {
      success: false,
      error: new Error("Not authenticated"),
    }
  }

  const { data: token } = tokenResult

  const choicesResult = await buildStorePrompts(apiUrl, token)

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
      message: "What store?",
      choices: choicesResult.data,
    },
  ])

  const switchResult = await switchUserStore(apiUrl, token, answers.store.id)

  if (!switchResult.success) {
    return {
      success: false,
      error: new Error(switchResult.error.message),
    }
  }

  store.set("store", answers.store)

  return {
    success: true,
    data: {},
  }
}

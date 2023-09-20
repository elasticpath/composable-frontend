import yargs from "yargs"
import Conf from "conf"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import { handleErrors } from "../../util/error-handler"
import {
  StoreCommandArguments,
  StoreCommandData,
  StoreCommandError,
} from "./store.types"
import { resolveHostFromRegion } from "../../util/resolve-region"
import { getToken } from "../../lib/authentication/get-token"
import {
  buildStorePrompts,
  switchUserStore,
} from "../../util/build-store-prompts"
import inquirer from "inquirer"
import { createAuthenticationMiddleware } from "../login/login-command"

export function createStoreCommand(
  ctx: CommandContext
): yargs.CommandModule<{}, StoreCommandArguments> {
  return {
    command: "store [subcommand]",
    describe: "interact with Elasticpath store",
    builder: (yargs) => {
      return yargs
        .middleware(createAuthenticationMiddleware(ctx))
        .command({
          command: "set",
          describe: "Set active store",
          handler: async (_args) => {
            await storeSelectCommand(ctx.store)
          },
        })
        .help("h")
    },
    handler: handleErrors(createStoreCommandHandler(ctx)),
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

export async function storeSelectCommand(store: Conf) {
  const apiUrl = resolveHostFromRegion(store.get("region") as any)
  const tokenResult = await getToken(apiUrl, store)

  if (!tokenResult.success) {
    console.error("Not authenticated: ", tokenResult.error)
    return
  }

  const { data: token } = tokenResult

  const choicesResult = await buildStorePrompts(apiUrl, token)

  if (!choicesResult.success) {
    console.error(choicesResult.error)
    return
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

  await switchUserStore(apiUrl, token, answers.store.id)
  store.set("store", answers.store)
}

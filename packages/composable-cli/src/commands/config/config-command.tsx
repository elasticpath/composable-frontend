import yargs from "yargs"
import Conf from "conf"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import { handleErrors } from "../../util/error-handler"
import {
  ConfigCommandArguments,
  ConfigCommandData,
  ConfigCommandError,
} from "./config.types"

export function configClearCommand(store: Conf): void {
  store.clear()
}

export function createConfigCommand(
  ctx: CommandContext
): yargs.CommandModule<{}, ConfigCommandArguments> {
  return {
    command: "config",
    describe: "interact with stored configuration",
    builder: (yargs) => {
      return yargs
        .command({
          command: "list",
          describe: "List all stored configuration",
          handler: (_args) => {
            console.log(ctx.store.store)
          },
        })
        .command({
          command: "clear",
          describe: "Clear all stored configuration",
          handler: (_args) => {
            configClearCommand(ctx.store)
          },
        })
        .help()
    },
    handler: handleErrors(createConfigCommandHandler(ctx)),
  }
}

export function createConfigCommandHandler(
  _ctx: CommandContext
): CommandHandlerFunction<
  ConfigCommandData,
  ConfigCommandError,
  ConfigCommandArguments
> {
  return async function configCommandHandler(_args) {
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

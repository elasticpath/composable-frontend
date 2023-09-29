import yargs from "yargs"
import Conf from "conf"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import {
  ConfigCommandArguments,
  ConfigCommandData,
  ConfigCommandError,
} from "./config.types"
import { trackCommandHandler } from "../../util/track-command-handler"

export function configClearCommand(store: Conf): void {
  store.clear()
}

export function createConfigCommand(
  ctx: CommandContext,
): yargs.CommandModule<{}, ConfigCommandArguments> {
  const { store, logger, handleErrors } = ctx

  return {
    command: "config",
    describe: "interact with stored configuration",
    builder: (yargs) => {
      return yargs
        .command({
          command: "list",
          describe: "List all stored configuration",
          handler: handleErrors(async (_args) => {
            logger.info(JSON.stringify(store.store, null, 2))
            return {
              success: true,
              data: {},
            }
          }),
        })
        .command({
          command: "clear",
          describe: "Clear all stored configuration",
          handler: handleErrors(async (_args) => {
            configClearCommand(store)
            return {
              success: true,
              data: {},
            }
          }),
        })
        .example("$0 config list", "list all stored configuration")
        .example("$0 config clear", "clear all stored configuration")
        .help()
        .demandCommand(1)
        .strict()
    },
    handler: handleErrors(trackCommandHandler(ctx, createConfigCommandHandler)),
  }
}

export function createConfigCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  ConfigCommandData,
  ConfigCommandError,
  ConfigCommandArguments
> {
  return async function configCommandHandler(_args) {
    const { logger } = ctx
    logger.error("command not recognized")
    return {
      success: false,
      error: {
        code: "command_not_recognized",
        message: "command not recognized",
      },
    }
  }
}

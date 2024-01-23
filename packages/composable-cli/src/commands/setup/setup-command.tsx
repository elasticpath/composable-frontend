import yargs from "yargs"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import {
  SetupCommandArguments,
  SetupCommandData,
  SetupCommandError,
} from "./setup.types"
import { trackCommandHandler } from "../../util/track-command-handler"
import { createComposableProjectMiddleware } from "../../lib/composable-project-middleware"
import { createSelfSignupCommand } from "./self-signup/self-signup-command"

export function createSetupCommand(
  ctx: CommandContext,
): yargs.CommandModule<RootCommandArguments, SetupCommandArguments> {
  return {
    command: "setup",
    aliases: ["setup"],
    describe: "setup Elastic Path Setups for your storefront",
    builder: (yargs) => {
      return yargs
        .middleware(createComposableProjectMiddleware(ctx))
        .command(createSelfSignupCommand(ctx))
        .help()
        .demandCommand(1)
        .strict()
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createSetupCommandHandler),
    ),
  }
}

export function createSetupCommandHandler(
  _ctx: CommandContext,
): CommandHandlerFunction<
  SetupCommandData,
  SetupCommandError,
  SetupCommandArguments
> {
  return async function SetupCommandHandler(_args) {
    return {
      success: false,
      error: {
        code: "missing-positional-argument",
        message:
          'missing positional argument did you mean to run "d2c" command?',
      },
    }
  }
}

import yargs from "yargs"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import { handleErrors } from "../../util/error-handler"
import {
  IntegrationCommandArguments,
  IntegrationCommandData,
  IntegrationCommandError,
} from "./integration.types"
import { trackCommandHandler } from "../../util/track-command-handler"
import { createAlgoliaIntegrationCommand } from "./algolia/algolia-integration-command"
import { createComposableProjectMiddleware } from "../../lib/composable-project-middleware"

export function createIntegrationCommand(
  ctx: CommandContext,
): yargs.CommandModule<RootCommandArguments, IntegrationCommandArguments> {
  return {
    command: "integration",
    aliases: ["int"],
    describe: "setup Elastic Path integrations for your storefront",
    builder: (yargs) => {
      return yargs
        .middleware(createComposableProjectMiddleware(ctx))
        .command(createAlgoliaIntegrationCommand(ctx))
        .help()
        .demandCommand(1)
        .strict()
    },
    handler: handleErrors(
      trackCommandHandler(ctx, createIntegrationCommandHandler),
    ),
  }
}

export function createIntegrationCommandHandler(
  _ctx: CommandContext,
): CommandHandlerFunction<
  IntegrationCommandData,
  IntegrationCommandError,
  IntegrationCommandArguments
> {
  return async function integrationCommandHandler(_args) {
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

import yargs from "yargs"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import { handleErrors } from "../../util/error-handler"

import { trackCommandHandler } from "../../util/track-command-handler"
import { createEPPaymentsCommand } from "./ep-payments/ep-payments-command"
import {
  PaymentsCommandArguments,
  PaymentsCommandData,
  PaymentsCommandError,
} from "./payments.types"
import { createActiveStoreMiddleware } from "../generate/generate-command"
import { createComposableProjectMiddleware } from "../../lib/composable-project-middleware"

export function createPaymentsCommand(
  ctx: CommandContext,
): yargs.CommandModule<RootCommandArguments, PaymentsCommandArguments> {
  return {
    command: "payments",
    aliases: ["p"],
    describe: "setup Elastic Path payment gateways for your storefront",
    builder: (yargs) => {
      return yargs
        .middleware(createComposableProjectMiddleware(ctx))
        .middleware(createActiveStoreMiddleware(ctx))
        .command(createEPPaymentsCommand(ctx))
        .help()
        .demandCommand(1)
        .strict()
    },
    handler: handleErrors(
      trackCommandHandler(ctx, createPaymentsCommandHandler),
    ),
  }
}

export function createPaymentsCommandHandler(
  _ctx: CommandContext,
): CommandHandlerFunction<
  PaymentsCommandData,
  PaymentsCommandError,
  PaymentsCommandArguments
> {
  return async function integrationCommandHandler(_args) {
    return {
      success: false,
      error: {
        code: "missing-positional-argument",
        message:
          'missing positional argument did you mean to run "ep-payments" command?',
      },
    }
  }
}

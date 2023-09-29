import yargs from "yargs"
import {
  CommandContext,
  CommandHandlerFunction,
  RootCommandArguments,
} from "../../types/command"
import {
  InsightsCommandArguments,
  InsightsCommandData,
  InsightsCommandError,
} from "./insights.types"
import { promptOptInProductInsights } from "../../lib/insights/opt-in-product-insights-middleware"
import { optInsights } from "../../util/has-opted-insights"
import { trackCommandHandler } from "../../util/track-command-handler"
import { isTTY } from "../../util/is-tty"

export function createInsightsCommand(
  ctx: CommandContext,
): yargs.CommandModule<RootCommandArguments, InsightsCommandArguments> {
  return {
    command: "insights",
    describe: "opt in/out product insights",
    builder: (yargs) => {
      return yargs
        .option("opt-in", {
          alias: "o",
          describe: "opt in to product insights",
          type: "boolean",
        })
        .help()
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createInsightsCommandHandler),
    ),
  }
}

export function createInsightsCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  InsightsCommandData,
  InsightsCommandError,
  InsightsCommandArguments
> {
  return async function configCommandHandler(args) {
    if (!args.interactive || !isTTY()) {
      console.warn("When not interactive, the opt-in flag must be provided.")
      return {
        success: false,
        error: {
          code: "not-interactive",
          message: "When not interactive, the opt-in flag must be provided.",
        },
      }
    }

    if (args.optIn === undefined) {
      await promptOptInProductInsights(ctx.store, ctx.logger)
      return {
        success: true,
        data: {},
      }
    }

    optInsights(ctx.store, args.optIn)
    return {
      success: true,
      data: {},
    }
  }
}

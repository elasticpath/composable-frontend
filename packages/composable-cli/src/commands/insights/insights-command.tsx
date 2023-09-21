import yargs from "yargs"
import { CommandContext, CommandHandlerFunction } from "../../types/command"
import { handleErrors } from "../../util/error-handler"
import {
  InsightsCommandArguments,
  InsightsCommandData,
  InsightsCommandError,
} from "./insights.types"
import { promptOptInProductInsights } from "../../lib/insights/opt-in-product-insights-middleware"
import { optInsights } from "../../util/has-opted-insights"
import { trackCommandHandler } from "../../util/track-command-handler"

export function createInsightsCommand(
  ctx: CommandContext
): yargs.CommandModule<{}, InsightsCommandArguments> {
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
    handler: handleErrors(
      trackCommandHandler(ctx, createInsightsCommandHandler)
    ),
  }
}

export function createInsightsCommandHandler(
  ctx: CommandContext
): CommandHandlerFunction<
  InsightsCommandData,
  InsightsCommandError,
  InsightsCommandArguments
> {
  return async function configCommandHandler(args) {
    if (args.optIn === undefined) {
      await promptOptInProductInsights(ctx.store)
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

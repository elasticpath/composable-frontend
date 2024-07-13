import { CommandContext, RootCommandArguments } from "../../types/command"
import { MiddlewareFunction } from "yargs"
import { isOptedInsights, optInsights } from "../../util/has-opted-insights"
import { renderInfo } from "../../commands/ui"
import { outputContent, outputToken } from "../../commands/output"

export function createOptInProductInsightsMiddleware(
  ctx: CommandContext,
): MiddlewareFunction<RootCommandArguments> {
  return async function optInProductInsightsMiddleware(
    args: RootCommandArguments,
  ) {
    const { store } = ctx

    if (isOptedInsights(store) || isInsightsCommand(args)) {
      return
    }

    if (!args.interactive) {
      optInsights(store, true)
      return
    }

    renderInfo({
      headline: "Improving our tools with your help",
      body: outputContent`This is a new tool. To help improve the experience we collect:
- Commands you run with composable cli
- Error messages

Your data will be used solely for improving our tools and user experiences and will always be kept private.

if you wish to opt out run ${outputToken.genericShellCommand("ep insights")}
`.value,
    })
    optInsights(store, true)
    return
  }
}

function isInsightsCommand(argv: any): boolean {
  return argv._[0] === "insights"
}

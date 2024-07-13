import yargs, { MiddlewareFunction } from "yargs"
import { CommandContext } from "../types/command"
import { renderWarning } from "../commands/ui"

export function createComposableProjectMiddleware(
  ctx: CommandContext,
): MiddlewareFunction {
  return async function composableProjectMiddleware(
    _args: yargs.ArgumentsCamelCase<{}>,
  ) {
    if (!ctx.composableRc) {
      renderWarning({
        headline:
          "Failed to find .composablerc, is this a Composable Frontend workspace?",
        body: "This command expects to be run in a composable frontend workspace and may not work as expected. It could be you're not inside your project folder.",
      })
    }
    return
  }
}

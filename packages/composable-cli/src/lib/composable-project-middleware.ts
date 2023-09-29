import yargs, { MiddlewareFunction } from "yargs"
import { CommandContext } from "../types/command"
import boxen from "boxen"

export function createComposableProjectMiddleware(
  ctx: CommandContext,
): MiddlewareFunction {
  return async function composableProjectMiddleware(
    _args: yargs.ArgumentsCamelCase<{}>,
  ) {
    if (!ctx.composableRc) {
      ctx.logger.info(
        boxen(
          "Failed to find .composablerc, is this a Composable Frontend workspace?\nThis command expects to be run in a composable frontend workspace and may not work as expected. It could be you're not inside your project folder.",
          { padding: 1, margin: 1, borderColor: "yellow" },
        ),
      )
    }
    return
  }
}

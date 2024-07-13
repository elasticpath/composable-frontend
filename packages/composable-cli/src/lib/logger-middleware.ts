import yargs, { MiddlewareFunction } from "yargs"
import { createConsoleLogger } from "@angular-devkit/core/node"
import { CommandContext } from "../types/command"

export function createLoggerMiddleware(
  ctx: CommandContext,
): MiddlewareFunction {
  return async function uuidMiddleware(
    args: yargs.ArgumentsCamelCase<{ verbose?: boolean }>,
  ) {
    if (args.verbose) {
      const { stdout, stderr, colors } = ctx

      ctx.logger = createConsoleLogger(args.verbose ?? false, stdout, stderr, {
        info: (s) => s,
        debug: (s) => s,
        warn: (s) => colors.bold.yellow(s),
        error: (s) => colors.bold.red(s),
        fatal: (s) => colors.bold.red(s),
      })
    }

    return
  }
}

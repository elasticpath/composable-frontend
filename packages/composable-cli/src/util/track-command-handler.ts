import { CommandContext, CommandHandlerFunction } from "../types/command"
import { ProcessOutput } from "@angular-devkit/core/node"

export function trackCommandHandler<
  TData,
  TError,
  TCommandArguments extends Record<string, any>
>(
  ctx: CommandContext,
  handler: (
    ctx: CommandContext,
    stdout?: ProcessOutput,
    stderr?: ProcessOutput
  ) => CommandHandlerFunction<TData, TError, TCommandArguments>
): CommandHandlerFunction<TData, TError, TCommandArguments> {
  return (args) => {
    if (ctx.posthog) {
      // Making sure to filter out any properties that might contain sensitive information
      const { _, $0, password, username, ...rest } = args
      ctx.posthog.postHogCapture({
        event: `composable cli command ${args._.join(" ")}`,
        properties: {
          ...rest,
        },
      })
    }

    return handler(ctx)(args)
  }
}

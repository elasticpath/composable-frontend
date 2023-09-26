import type Conf from "conf"
import type fetch from "node-fetch"
import type yargs from "yargs"
import type { PostHog } from "posthog-node"
import type { createPostHogCapture } from "../lib/insights/capture-posthog"
import type { ProcessOutput } from "@angular-devkit/core/node"
import { logging } from "@angular-devkit/core"
import ansiColors from "ansi-colors"

export type CommandResult<TData, TError> =
  | {
      success: true
      data: TData
    }
  | {
      success: false
      error: TError
    }

export type CommandContext = {
  store: Conf
  requester: typeof fetch
  rawRequester: typeof fetch
  posthog?: {
    client: PostHog
    postHogCapture: Awaited<ReturnType<typeof createPostHogCapture>>
  }
  stdout: ProcessOutput
  stderr: ProcessOutput
  logger: logging.Logger
  colors: typeof ansiColors
}

export type RootCommandArguments = {
  interactive: boolean
  verbose: boolean
}

export type CommandHandlerFunction<
  TData,
  TError,
  TCommandArguments extends Record<string, any>,
> = (
  args: yargs.ArgumentsCamelCase<TCommandArguments>,
) => Promise<CommandResult<TData, TError>>

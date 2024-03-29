import type Conf from "conf"
import type fetch from "node-fetch"
import type yargs from "yargs"
import type { PostHog } from "posthog-node"
import type { createPostHogCapture } from "../lib/insights/capture-posthog"
import type { ProcessOutput } from "@angular-devkit/core/node"
import { logging } from "@angular-devkit/core"
import ansiColors from "ansi-colors"
import { Moltin } from "@moltin/sdk"
import { ComposableRc } from "../lib/composable-rc-schema"
import { ErrorHandler } from "../util/error-handler"

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
  /**
   * Requester makes fetch requests with authentication headers and host values preset
   * e.g. requester("/v2/user") will make a request to the configured host with the authenticated users access token
   */
  requester: typeof fetch
  /**
   * rawRequester makes fetch requests without any authentication headers or host values preset
   */
  rawRequester: typeof fetch
  posthog?: {
    client: PostHog
    postHogCapture: Awaited<ReturnType<typeof createPostHogCapture>>
  }
  stdout: ProcessOutput
  stderr: ProcessOutput
  logger: logging.Logger
  colors: typeof ansiColors
  epClient?: Moltin
  composableRc?: ComposableRc
  workspaceRoot?: string
  handleErrors: ErrorHandler
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

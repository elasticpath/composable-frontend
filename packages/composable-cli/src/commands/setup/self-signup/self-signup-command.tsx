import yargs from "yargs"

import { CommandContext, CommandHandlerFunction } from "../../../types/command"
import { trackCommandHandler } from "../../../util/track-command-handler"
import { createAuthenticationCheckerMiddleware } from "../../generate/generate-command"
import { processUnknownError } from "../../../util/process-unknown-error"
import {
  SelfSignupCommandArguments,
  SelfSignupCommandData,
  SelfSignupCommandError,
} from "./self-signup.types"
import { SetupCommandArguments } from "../setup.types"
import { Listr } from "listr2"
import {
  setupAccountsTask,
  SetupAccountTaskContext,
} from "../../generate/d2c/tasks/setup-accounts"

export function createSelfSignupCommand(
  ctx: CommandContext,
): yargs.CommandModule<SetupCommandArguments, SelfSignupCommandArguments> {
  return {
    command: "self-signup",
    describe: "setup EP  gateway for your Elastic Path powered storefront",
    builder: async (yargs) => {
      return yargs
        .middleware(createAuthenticationCheckerMiddleware(ctx))
        .fail(false)
        .help()
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createSelfSignupCommandHandler),
    ),
  }
}

/**
 * Setup SelfSignup
 *  - configure account settings
 *    - self-signup
 *    - auto create account for account members
 *    - Account Member self management
 *  - create a password profile
 *    - should have "email" for the username_format property
 *    - should have a predictable name
 */
export function createSelfSignupCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  SelfSignupCommandData,
  SelfSignupCommandError,
  SelfSignupCommandArguments
> {
  return async function selfSignupCommandHandler(_args) {
    const { epClient, logger, workspaceRoot } = ctx

    try {
      if (!epClient) {
        return {
          success: false,
          error: {
            code: "missing_ep_client",
            message: "Failed to setup SelfSignup  - missing EP client",
          },
        }
      }

      if (!workspaceRoot) {
        return {
          success: false,
          error: {
            code: "missing_workspace_root",
            message: "Failed to setup self signup  - missing workspace root",
          },
        }
      }

      const tasks = new Listr<SetupAccountTaskContext>([
        {
          title: "Setup Accounts",
          task: setupAccountsTask,
        },
      ])

      await tasks.run({ client: epClient, workspaceRoot })

      return {
        success: true,
        data: {},
      }
    } catch (e) {
      logger.error(processUnknownError(e))
      return {
        success: false,
        error: {
          code: "FAILED_TO_SETUP_MANUAL_GATEWAY",
          message: "Failed to setup SelfSignup gateway",
        },
      }
    }
  }
}

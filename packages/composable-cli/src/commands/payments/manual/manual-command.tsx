import yargs from "yargs"

import { CommandContext, CommandHandlerFunction } from "../../../types/command"
import { trackCommandHandler } from "../../../util/track-command-handler"
import { createAuthenticationCheckerMiddleware } from "../../generate/generate-command"
import { PaymentsCommandArguments } from "../payments.types"
import { processUnknownError } from "../../../util/process-unknown-error"
import {
  ManualCommandArguments,
  ManualCommandData,
  ManualCommandError,
  ManualCommandErrorAlreadyExists,
} from "./manual-integration.types"
import { createManualTasks } from "./tasks/manual"
import { Listr } from "listr2"

export function createManualPaymentCommand(
  ctx: CommandContext,
): yargs.CommandModule<PaymentsCommandArguments, ManualCommandArguments> {
  return {
    command: "manual",
    describe:
      "setup EP Payment gateway for your Elastic Path powered storefront",
    builder: async (yargs) => {
      return yargs
        .middleware(createAuthenticationCheckerMiddleware(ctx))
        .option("force", {
          type: "boolean",
          description: "Force setup of Manual even if already enabled",
        })
        .fail(false)
        .help()
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createManualPaymentCommandHandler),
    ),
  }
}

export function createManualPaymentCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  ManualCommandData,
  ManualCommandError,
  ManualCommandArguments
> {
  return async function manualPaymentCommandHandler(_args) {
    const { epClient, logger, workspaceRoot } = ctx

    try {
      if (!epClient) {
        throw new Error("Failed to setup Manual Payment - missing EP client")
      }
      if (!workspaceRoot) {
        throw new Error(
          "Failed to setup Manual Payment - missing workspace root",
        )
      }

      const task = new Listr([
        {
          title: "Setup Manual Payment",
          task: createManualTasks,
        },
      ])

      await task.run({
        client: epClient,
        workspaceRoot,
      })

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
          message: "Failed to setup Manual gateway",
        },
      }
    }
  }
}

export function isManualGatewayAlreadyExistsError(
  error: ManualCommandError,
): error is ManualCommandErrorAlreadyExists {
  return error.code === "manual_already_setup"
}

// async function resolveForceOptions(
//   args: ManualCommandArguments,
// ): Promise<EPPaymentsForce> {
//   if (args.interactive && isTTY()) {
//     const { force } = await inquirer.prompt([
//       {
//         type: "confirm",
//         name: "force",
//         message: "Manual is already enabled would you like update anyway?",
//       },
//     ])
//     return {
//       force,
//     }
//   }
//
//   throw new Error(
//     `Invalid arguments: Manual is already enabled and missing force argument`,
//   )
// }

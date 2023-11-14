import yargs from "yargs"

import { CommandContext, CommandHandlerFunction } from "../../../types/command"
import { trackCommandHandler } from "../../../util/track-command-handler"
import { createAuthenticationCheckerMiddleware } from "../../generate/generate-command"
import { PaymentsCommandArguments } from "../payments.types"
import inquirer from "inquirer"
import { isTTY } from "../../../util/is-tty"
import boxen from "boxen"
import ora from "ora"
import { setupManualPaymentGateway } from "./util/setup-epcc-manual-gateway"
import { EPPaymentsForce } from "./util/setup-ep-payments-schema"
import { processUnknownError } from "../../../util/process-unknown-error"
import { checkGateway } from "@elasticpath/composable-common"
import {
  ManualCommandArguments,
  ManualCommandData,
  ManualCommandError,
  ManualCommandErrorAlreadyExists,
} from "./manual-integration.types"

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
  return async function manualPaymentCommandHandler(args) {
    const spinner = ora()

    const { epClient, logger } = ctx

    try {
      if (!epClient) {
        spinner.fail(`Failed to setup Manual Payment.`)
        return {
          success: false,
          error: {
            code: "missing_ep_client",
            message: "Failed to setup Manual Payment - missing EP client",
          },
        }
      }

      spinner.start(`Checking if Manual gateway already exists...`)
      // check if Manual gateway is already setup
      if (!args.force) {
        const checkGatewayResult = await checkGateway(epClient, "manual")
        spinner.stop()

        if (checkGatewayResult.success) {
          const forceResult = await resolveForceOptions(args)

          if (!forceResult.force) {
            spinner.fail(
              `Manual gateway already exists and you didn't want to force an update.`,
            )

            logger.warn(
              boxen("`Manual was already setup.", {
                padding: 1,
                borderColor: "yellow",
              }),
            )
            return {
              success: false,
              error: {
                code: "manual_already_setup",
                message: "Manual was already setup",
              },
            }
          }
        }
      }

      spinner.start(`Setting up Manual gateway...`)
      const result = await setupManualPaymentGateway(epClient, logger)

      if (!result.success) {
        spinner.fail(`Failed to setup Manual Gateway.`)
        return {
          success: false,
          error: {
            code: "manual_gateway_setup_failed",
            message: "Failed to setup Manual",
          },
        }
      }

      spinner.succeed(`Manual setup successfully.`)

      return {
        success: true,
        data: {},
      }
    } catch (e) {
      spinner.fail(`Failed to setup Manual gateway.`)
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

async function resolveForceOptions(
  args: ManualCommandArguments,
): Promise<EPPaymentsForce> {
  if (args.interactive && isTTY()) {
    const { force } = await inquirer.prompt([
      {
        type: "confirm",
        name: "force",
        message: "Manual is already enabled would you like update anyway?",
      },
    ])
    return {
      force,
    }
  }

  throw new Error(
    `Invalid arguments: Manual is already enabled and missing force argument`,
  )
}

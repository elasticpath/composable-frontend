import yargs from "yargs"
import {
  EPPaymentsCommandArguments,
  EPPaymentsCommandData,
  EPPaymentsCommandError,
  EPPaymentsCommandErrorAlreadyExists,
} from "./ep-payments-integration.types"
import { CommandContext, CommandHandlerFunction } from "../../../types/command"
import { handleErrors } from "../../../util/error-handler"
import { trackCommandHandler } from "../../../util/track-command-handler"
import {
  createActiveStoreMiddleware,
  createAuthenticationCheckerMiddleware,
} from "../../generate/generate-command"
import { PaymentsCommandArguments } from "../payments.types"
import * as ansiColors from "ansi-colors"
import inquirer from "inquirer"
import { isTTY } from "../../../util/is-tty"
import boxen from "boxen"
import ora from "ora"
import { logging } from "@angular-devkit/core"
import { setupEPPaymentsPaymentGateway } from "./util/setup-epcc-ep-payment"
import {
  EPPaymentsForce,
  EPPaymentsSetup,
  epPaymentsSetupSchema,
} from "./util/setup-ep-payments-schema"
import { processUnknownError } from "../../../util/process-unknown-error"
import { attemptToAddEnvVariables } from "../../../lib/devkit/add-env-variables"
import { checkGateway } from "@elasticpath/composable-common"

export function createEPPaymentsCommand(
  ctx: CommandContext,
): yargs.CommandModule<PaymentsCommandArguments, EPPaymentsCommandArguments> {
  return {
    command: "ep-payments",
    describe:
      "setup EP Payment gateway for your Elastic Path powered storefront",
    builder: async (yargs) => {
      return yargs
        .middleware(createAuthenticationCheckerMiddleware(ctx))
        .middleware(createActiveStoreMiddleware(ctx))
        .option("account-id", {
          type: "string",
          description: "EP Payments account ID",
        })
        .option("publishable-key", {
          type: "string",
          description: "EP Payments publishable key",
        })
        .option("force", {
          type: "boolean",
          description: "Force setup of EP Payments even if already enabled",
        })
        .fail(false)
        .help()
    },
    handler: handleErrors(
      trackCommandHandler(ctx, createEPPaymentsCommandHandler),
    ),
  }
}

export function isAlreadyExistsError(
  error: EPPaymentsCommandError,
): error is EPPaymentsCommandErrorAlreadyExists {
  return error.code === "ep_payments_already_setup"
}

export function createEPPaymentsCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  EPPaymentsCommandData,
  EPPaymentsCommandError,
  EPPaymentsCommandArguments
> {
  return async function epPaymentsCommandHandler(args) {
    const spinner = ora()

    const { epClient, logger } = ctx

    try {
      if (!epClient) {
        spinner.fail(`Failed to setup EP Payments.`)
        return {
          success: false,
          error: {
            code: "missing_ep_client",
            message: "Failed to setup EP Payments - missing EP client",
          },
        }
      }

      spinner.start(`Checking if EP Payments already exists...`)
      // check if EP Payments is already setup
      if (!args.force) {
        const checkGatewayResult = await checkGateway(
          epClient,
          "elastic_path_payments_stripe",
        )
        spinner.stop()

        if (checkGatewayResult.success) {
          const forceResult = await resolveForceOptions(args)

          if (!forceResult.force) {
            spinner.fail(
              `EP Payments already exists and you didn't want to force an update.`,
            )

            const existingAccountId = checkGatewayResult.data.stripe_account!
            logger.warn(
              boxen(
                `EP Payments was already setup with account id: ${ctx.colors.bold.green(
                  existingAccountId,
                )}\n\nMake sure you add the correct account id NEXT_PUBLIC_STRIPE_ACCOUNT_ID=${existingAccountId} and with the appropriate publishable key NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file.`,
                { padding: 1, borderColor: "yellow" },
              ),
            )
            return {
              success: false,
              error: {
                code: "ep_payments_already_setup",
                message: "EP Payments was already setup",
                accountId: existingAccountId,
              },
            }
          }
        }
      }

      const options = await resolveOptions(args, logger, ansiColors)

      spinner.start(`Setting up EP Payments...`)
      const result = await setupEPPaymentsPaymentGateway(
        {
          epPaymentsStripeAccountId: options.accountId,
          epPaymentsStripePublishableKey: options.publishableKey,
        },
        epClient,
        logger,
      )

      if (!result.success) {
        spinner.fail(`Failed to setup EP Payments.`)
        return {
          success: false,
          error: {
            code: "ep_payments_setup_failed",
            message: "Failed to setup EP Payments",
          },
        }
      }

      await attemptToAddEnvVariables(ctx, spinner, {
        NEXT_PUBLIC_STRIPE_ACCOUNT_ID: options.accountId,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: options.publishableKey,
      })

      spinner.succeed(`EP Payments setup successfully.`)

      return {
        success: true,
        data: {
          accountId: options.accountId,
          publishableKey: options.publishableKey,
        },
      }
    } catch (e) {
      spinner.fail(`Failed to setup EP Payment gateway.`)
      logger.error(processUnknownError(e))
      return {
        success: false,
        error: {
          code: "FAILED_TO_SETUP_EP_PAYMENT_GATEWAY",
          message: "Failed to setup EP Payment gateway",
        },
      }
    }
  }
}

async function resolveOptions(
  args: EPPaymentsCommandArguments,
  logger: logging.Logger,
  colors: typeof ansiColors,
): Promise<EPPaymentsSetup> {
  if (args.interactive && isTTY()) {
    return epPaymentsOptionsPrompts(args, logger, colors)
  }

  const parsed = epPaymentsSetupSchema.safeParse({
    accountId: args.accountId,
    publishableKey: args.publishableKey,
  })

  if (!parsed.success) {
    throw new Error(`Invalid arguments: ${JSON.stringify(parsed.error)}`)
  }

  return parsed.data
}

async function resolveForceOptions(
  args: EPPaymentsCommandArguments,
): Promise<EPPaymentsForce> {
  if (args.interactive && isTTY()) {
    const { force } = await inquirer.prompt([
      {
        type: "confirm",
        name: "force",
        message: "EP Payments is already enabled would you like update anyway?",
      },
    ])
    return {
      force,
    }
  }

  throw new Error(
    `Invalid arguments: ep payments is already enabled and missing force argument`,
  )
}

async function epPaymentsOptionsPrompts(
  args: EPPaymentsCommandArguments,
  logger: logging.Logger,
  _colors: typeof ansiColors,
): Promise<EPPaymentsSetup> {
  const { accountId: argsAccountId, publishableKey: argsPublishableKey } = args

  if (!argsAccountId && !argsPublishableKey) {
    logger.info(
      boxen(
        `If you don't have an EP payments account setup reach out to us \nhttps://www.elasticpath.com/products/payments`,
        {
          padding: 1,
          margin: 1,
        },
      ),
    )
  }

  let gatheredOptions = {}

  if (!argsAccountId) {
    const { accountId } = await inquirer.prompt([
      {
        type: "string",
        name: "accountId",
        message: "What is your EP Payments account ID?",
      },
    ])

    gatheredOptions = {
      ...gatheredOptions,
      accountId,
    }
  } else {
    gatheredOptions = {
      ...gatheredOptions,
      accountId: argsAccountId,
    }
  }

  if (!argsPublishableKey) {
    const { publishableKey } = await inquirer.prompt([
      {
        type: "password",
        name: "publishableKey",
        message: "What is your EP Payments publishable key?",
        mask: "*",
      },
    ])

    gatheredOptions = {
      ...gatheredOptions,
      publishableKey,
    }
  } else {
    gatheredOptions = {
      ...gatheredOptions,
      publishableKey: argsPublishableKey,
    }
  }

  return gatheredOptions as any
}

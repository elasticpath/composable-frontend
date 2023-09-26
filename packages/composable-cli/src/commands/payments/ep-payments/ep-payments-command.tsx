import yargs from "yargs"
import {
  EPPaymentsCommandArguments,
  EPPaymentsCommandData,
  EPPaymentsCommandError,
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
  EPPaymentsSetup,
  epPaymentsSetupSchema,
} from "./util/setup-ep-payments-schema"

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
        .fail(false)
        .help()
    },
    handler: handleErrors(
      trackCommandHandler(ctx, createEPPaymentsCommandHandler),
    ),
  }
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

    try {
      if (!ctx.epClient) {
        spinner.fail(`Failed to setup EP Payments.`)
        return {
          success: false,
          error: {
            code: "missing_ep_client",
            message: "Failed to setup EP Payments - missing EP client",
          },
        }
      }

      const options = await resolveOptions(args, ctx.logger, ansiColors)

      spinner.start(`Setting up EP Payments...`)
      const result = await setupEPPaymentsPaymentGateway(
        {
          epPaymentsStripeAccountId: options.accountId,
          epPaymentsStripePublishableKey: options.publishableKey,
        },
        ctx.epClient,
        ctx.logger,
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

      if (result.data.stripe_account !== options.accountId) {
        spinner.succeed(`EP Payments was already setup.`)
        return {
          success: true,
          data: {},
        }
      }

      spinner.succeed(`EP Payments setup successfully.`)
      return {
        success: true,
        data: {},
      }
    } catch (e) {
      spinner.fail(`Failed to setup Algolia integration`)
      return {
        success: false,
        error: {
          code: "ALGOLIA_INTEGRATION_SETUP_FAILED",
          message: "Failed to setup Algolia integration",
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

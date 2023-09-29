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
import {
  callRule,
  HostTree,
  SchematicContext,
} from "@angular-devkit/schematics"
import { processUnknownError } from "../../../util/process-unknown-error"
import { Result } from "../../../types/results"
import { addEnvVariables } from "../../../lib/devkit/add-env-variables"
import { commitTree, createScopedHost } from "../../../lib/devkit/tree-util"

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
        await attemptToAddEnvVariables(ctx, spinner, {
          accountId: result.data.stripe_account!,
          publishableKey: options.publishableKey,
        })

        spinner.succeed(`EP Payments was already setup.`)

        const alreadyExistingAccountId = result.data.stripe_account!

        ctx.logger.warn(
          boxen(
            `EP Payments was already setup with account id: ${ctx.colors.bold.green(
              alreadyExistingAccountId,
            )}\n\nMake sure you add the correct account id NEXT_PUBLIC_STRIPE_ACCOUNT_ID=${alreadyExistingAccountId} and with the appropriate publishable key NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file.`,
            { padding: 1, borderColor: "yellow" },
          ),
        )

        return {
          success: true,
          data: {},
        }
      }

      await attemptToAddEnvVariables(ctx, spinner, {
        accountId: result.data.stripe_account!,
        publishableKey: options.publishableKey,
      })

      spinner.succeed(`EP Payments setup successfully.`)

      return {
        success: true,
        data: {},
      }
    } catch (e) {
      spinner.fail(`Failed to setup EP Payment gateway.`)
      ctx.logger.error(processUnknownError(e))
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

async function attemptToAddEnvVariables(
  ctx: CommandContext,
  spinner: ora.Ora,
  { accountId, publishableKey }: EpPaymentEnvVariableRecord,
): Promise<Result<{}, { code: string; message: string }>> {
  const { workspaceRoot, composableRc } = ctx

  if (!composableRc) {
    return {
      success: false,
      error: {
        code: "NO_COMPOSABLE_RC",
        message: "Could not detect workspace root - missing composable.rc file",
      },
    }
  }

  spinner.start(
    `Adding EP Payments environment variables to .env.local file...`,
  )

  if (!workspaceRoot) {
    spinner.fail(
      `Failed to add environment variables to .env.local file - missing workspace root`,
    )
    return {
      success: false,
      error: {
        code: "EP",
        message:
          "Setup of EP Payment gateway succeeded but failed to add env variables to .env.local file",
      },
    }
  }

  await addEpPaymentEnvVariables(workspaceRoot, {
    accountId,
    publishableKey,
  })

  spinner.succeed(`Added EP Payments environment variables to .env.local file.`)

  return {
    success: true,
    data: {},
  }
}

type EpPaymentEnvVariableRecord = { accountId: string; publishableKey: string }

async function addEpPaymentEnvVariables(
  workspaceRoot: string,
  { accountId, publishableKey }: EpPaymentEnvVariableRecord,
): Promise<void> {
  const host = createScopedHost(workspaceRoot)

  const initialTree = new HostTree(host)

  if (!initialTree.exists(".env.local")) {
    initialTree.create(".env.local", "")
  }

  const context = {} as unknown as SchematicContext

  const rule = addEnvVariables(
    {
      NEXT_PUBLIC_STRIPE_ACCOUNT_ID: accountId,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: publishableKey,
    },
    ".env.local",
  )

  const tree = await callRule(rule, initialTree, context).toPromise()

  await commitTree(host, tree)
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

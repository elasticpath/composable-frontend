import yargs from "yargs"
import {
  EPPaymentsCommandArguments,
  EPPaymentsCommandData,
  EPPaymentsCommandError,
  EPPaymentsCommandErrorAlreadyExists,
} from "./ep-payments-integration.types"
import { CommandContext, CommandHandlerFunction } from "../../../types/command"
import { trackCommandHandler } from "../../../util/track-command-handler"
import { createAuthenticationCheckerMiddleware } from "../../generate/generate-command"
import { PaymentsCommandArguments } from "../payments.types"
import * as ansiColors from "ansi-colors"
import inquirer from "inquirer"
import { isTTY } from "../../../util/is-tty"
import {
  EPPaymentsSetup,
  epPaymentsSetupSchema,
} from "./util/setup-ep-payments-schema"
import { processUnknownError } from "../../../util/process-unknown-error"
import { Listr } from "listr2"
import { createEPPaymentTasks } from "../manual/tasks/ep-payment"
import { renderInfo } from "../../ui"

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
    handler: ctx.handleErrors(
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
    const { epClient, logger, workspaceRoot } = ctx

    try {
      if (!epClient) {
        throw new Error("Failed to setup EP Payments - missing EP client")
      }

      if (!workspaceRoot) {
        throw new Error("Failed to setup EP Payments - missing workspace root")
      }

      // check if EP Payments is already setup
      const options = await resolveOptions(args, ansiColors)

      const task = new Listr([
        {
          title: "EP payments setup",
          task: createEPPaymentTasks,
        },
      ])

      await task.run({
        accountId: options.accountId,
        publishableKey: options.publishableKey,
        client: epClient,
        workspaceRoot,
      })

      return {
        success: true,
        data: {
          accountId: options.accountId,
          publishableKey: options.publishableKey,
        },
      }
    } catch (e) {
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
  colors: typeof ansiColors,
): Promise<EPPaymentsSetup> {
  if (args.interactive && isTTY()) {
    return epPaymentsOptionsPrompts(args, colors)
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

// async function resolveForceOptions(
//   args: EPPaymentsCommandArguments,
// ): Promise<EPPaymentsForce> {
//   if (args.interactive && isTTY()) {
//     const { force } = await inquirer.prompt([
//       {
//         type: "confirm",
//         name: "force",
//         message: "EP Payments is already enabled would you like update anyway?",
//       },
//     ])
//     return {
//       force,
//     }
//   }
//
//   throw new Error(
//     `Invalid arguments: ep payments is already enabled and missing force argument`,
//   )
// }

async function epPaymentsOptionsPrompts(
  args: EPPaymentsCommandArguments,
  _colors: typeof ansiColors,
): Promise<EPPaymentsSetup> {
  const { accountId: argsAccountId, publishableKey: argsPublishableKey } = args

  if (!argsAccountId && !argsPublishableKey) {
    renderInfo({
      body: `If you don't have an EP payments account setup reach out to us \nhttps://www.elasticpath.com/products/payments`,
    })
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

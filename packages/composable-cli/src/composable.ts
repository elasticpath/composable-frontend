#!/usr/bin/env node

// symbol polyfill must go first
import "symbol-observable"
import { ProcessOutput } from "@angular-devkit/core/node"
import yargs from "yargs/yargs"
import { createLoginCommand } from "./commands/login/login-command"
import { createConfigCommand } from "./commands/config/config-command"
import { createCommandContext } from "./util/command"
import { createLogoutCommand } from "./commands/logout/logout-command"
import { createFeedbackCommand } from "./commands/feedback/feedback-command"
import { createStoreCommand } from "./commands/store/store-command"
import { createGenerateCommand } from "./commands/generate/generate-command"
import { hideBin } from "yargs/helpers"
import { createOptInProductInsightsMiddleware } from "./lib/insights/opt-in-product-insights-middleware"
import { createInsightsCommand } from "./commands/insights/insights-command"
import { createPostHogMiddleware } from "./lib/insights/posthog-middleware"
import { createUUIDMiddleware } from "./lib/insights/uuid-middleware"

export interface MainOptions {
  argv: string[]
  stdout?: ProcessOutput
  stderr?: ProcessOutput
}

const commandContext = createCommandContext()

// eslint-disable-next-line max-lines-per-function
export async function main({
  argv,
  stdout = process.stdout,
  stderr = process.stderr,
}: MainOptions): Promise<1 | 0> {
  try {
    commandContext.stdout = stdout
    commandContext.stderr = stderr

    await yargs(hideBin(argv))
      .middleware(createUUIDMiddleware(commandContext))
      .middleware(createOptInProductInsightsMiddleware(commandContext))
      .middleware(createPostHogMiddleware(commandContext))
      .option("interactive", {
        type: "boolean",
        default: true,
        describe: "Setting to false disables interactive input prompts.",
      })
      .option("verbose", {
        alias: "v",
        type: "boolean",
        default: false,
        description: "Run with verbose logging",
      })
      .command(createLoginCommand(commandContext))
      .command(createLogoutCommand(commandContext))
      .command(createFeedbackCommand(commandContext))
      .command(createConfigCommand(commandContext))
      .command(createStoreCommand(commandContext))
      .command(createGenerateCommand(commandContext))
      .command(createInsightsCommand(commandContext))
      .example("$0 login", "using interactive prompts")
      .example("$0 logout", "logout of the CLI")
      .strictCommands()
      .demandCommand(1)
      .help("h").argv

    return 0
  } catch (e) {
    console.error(e)
    return 1
  } finally {
    if (commandContext.posthog) {
      await commandContext.posthog.client.shutdownAsync()
    }
  }
}

if (require.main === module) {
  main({ argv: process.argv })
    .then((exitCode) => (process.exitCode = exitCode))
    .catch((e) => {
      throw e
    })
}

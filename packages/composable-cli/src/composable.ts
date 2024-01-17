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
import { createIntegrationCommand } from "./commands/integration/integration-command"
import { createLoggerMiddleware } from "./lib/logger-middleware"
import { createPaymentsCommand } from "./commands/payments/payments-command"
import { createEpClientMiddleware } from "./lib/authentication/ep-client-middleware"
import { createConfigMiddleware } from "./lib/config-middleware"
import { createSetupCommand } from "./commands/setup/setup-command"
import { renderSuccess } from "./commands/ui"
import {
  formatPackageManagerCommand,
  outputContent,
  outputToken,
} from "./commands/output"
import { packageManager } from "./commands/node-package-manager"
import filterConsole from "filter-console"

export interface MainOptions {
  argv: string[]
  stdout?: ProcessOutput
  stderr?: ProcessOutput
}

/**
 * Filter console logs for elastic path js-sdk as it pollutes the cli output
 */
filterConsole(["Token status: credentials do not exist"])

// eslint-disable-next-line max-lines-per-function
export async function main({
  argv,
  stdout = process.stdout,
  stderr = process.stderr,
}: MainOptions): Promise<1 | 0> {
  const commandContext = createCommandContext({
    stdout,
    stderr,
  })

  try {
    await yargs(hideBin(argv))
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
      .middleware(createLoggerMiddleware(commandContext))
      .middleware(createConfigMiddleware(commandContext))
      .middleware(createUUIDMiddleware(commandContext))
      .middleware(createOptInProductInsightsMiddleware(commandContext))
      .middleware(createPostHogMiddleware(commandContext))
      .middleware(createEpClientMiddleware(commandContext))
      .command({
        command: "temp",
        describe: "Temp command for testing",
        handler: () => {
          // renderSuccess({
          //   headline: "This is an example of a headline",
          //   body: {
          //     list: {
          //       items: ["test string".padEnd(2) + chalk.dim(`[THING]`)],
          //     },
          //   },
          // })

          const notes = [
            {
              title: "Note 1",
              description: "This is a description",
            },
            {
              title: "Note 2",
              description: "This is a description",
            },
          ]

          renderSuccess({
            headline: `Storefront setup complete`,
            body: ["Body line 1", "Body line 2"],

            // Use `customSections` instead of `nextSteps` and `references`
            // here to enforce a newline between title and items.
            customSections: [
              {
                title: "Help\n",
                body: {
                  list: {
                    items: [
                      {
                        link: {
                          label: "Guides",
                          url: "https://any.com",
                        },
                      },
                      {
                        link: {
                          label: "API reference",
                          url: "https://any.com",
                        },
                      },
                      {
                        link: {
                          label: "Demo Store code",
                          url: "https://any.com",
                        },
                      },
                      [
                        "Run",
                        {
                          command: `ep --help`,
                        },
                      ],
                    ],
                  },
                },
              },
              {
                title: "Next steps\n",
                body: [
                  {
                    list: {
                      items: [
                        [
                          "Run",
                          {
                            command:
                              outputContent`${outputToken.genericShellCommand(
                                [
                                  "" === process.cwd()
                                    ? undefined
                                    : `cd ${"tester".replace(/^\.\//, "")}`,
                                  false
                                    ? undefined
                                    : `${packageManager} install`,
                                  formatPackageManagerCommand(
                                    packageManager[0],
                                    "dev",
                                  ),
                                ]
                                  .filter(Boolean)
                                  .join(" && "),
                              )}`.value,
                          },
                        ],
                        [
                          "Run",
                          {
                            command: "testerson",
                          },
                        ],
                        ...notes.map((note) => {
                          return [
                            note.title,
                            {
                              command: note.description,
                            },
                          ]
                        }),
                      ].filter((step): step is string[] => Boolean(step)),
                    },
                  },
                ],
              },
            ].filter((step): step is { title: string; body: any } =>
              Boolean(step),
            ),
          })
        },
      })
      .command(createLoginCommand(commandContext))
      .command(createLogoutCommand(commandContext))
      .command(createFeedbackCommand(commandContext))
      .command(createConfigCommand(commandContext))
      .command(createStoreCommand(commandContext))
      .command(createGenerateCommand(commandContext))
      .command(createInsightsCommand(commandContext))
      .command(createIntegrationCommand(commandContext))
      .command(createPaymentsCommand(commandContext))
      .command(createSetupCommand(commandContext))
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

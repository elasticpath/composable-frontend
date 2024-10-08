import yargs from "yargs"
import { logging, schema } from "@angular-devkit/core"
import { createConsoleLogger } from "@angular-devkit/core/node"
import * as ansiColors from "ansi-colors"
import {
  FileSystemCollectionDescription,
  FileSystemSchematicDescription,
  NodeWorkflow,
} from "@angular-devkit/schematics/tools"

import * as inquirer from "inquirer"
import {
  Collection,
  UnsuccessfulWorkflowExecution,
} from "@angular-devkit/schematics"
import { camelCase, decamelize } from "yargs-parser"
import {
  D2CCommandArguments,
  D2CCommandData,
  D2CCommandError,
} from "./d2c.types"
import {
  CommandContext,
  CommandHandlerFunction,
  CommandResult,
} from "../../../types/command"
import { getRegion, resolveHostFromRegion } from "../../../util/resolve-region"
import { createApplicationKeys } from "../../../util/create-client-secret"
import { getStore } from "../../../lib/stores/get-store"
import { selectStoreById } from "../../store/store-command"
import { trackCommandHandler } from "../../../util/track-command-handler"
import { addSchemaOptionsToCommand } from "../utils/add-schema-options-command"
import { getSchematicOptions } from "../utils/get-schematic-options"
import { getOrCreateWorkflowForBuilder } from "../utils/get-or-create-workflow-for-builder"
import { resolveD2CCollectionName } from "../utils/resolve-d2c-collection-name"
import { isTTY } from "../../../util/is-tty"
import { GenerateCommandArguments } from "../generate.types"
import { Option } from "../utils/json-schema"
import {
  createActiveStoreMiddleware,
  createAuthenticationCheckerMiddleware,
  createTTYCheckMiddleware,
} from "../generate-command"
import { detect } from "../../../lib/detect-package-manager"
import { getCredentials } from "../../../lib/authentication/get-token"
import { paramCase } from "change-case"
import { exists } from "find-up"
import { createD2CSetupTask } from "./tasks/setup"
import { createManualTasks } from "../../payments/manual/tasks/manual"
import { createEPPaymentTasks } from "../../payments/manual/tasks/ep-payment"
import { D2CSetupTaskContext } from "./tasks/types"
import { createAlgoliaTask } from "../../integration/algolia/tasks/algolia-task"
import { resolveConfStoreData } from "../../integration/algolia/algolia-integration-command"
import { renderError, renderInfo, renderSuccess, renderWarning } from "../../ui"
import {
  formatPackageManagerCommand,
  outputContent,
  outputToken,
} from "../../output"
import chalk from "chalk"
import { basename, resolvePath } from "../../path"
import { SchematicEngineHost } from "../utils/schematic-engine-host"
import { createKlevuTask } from "../../integration/klevu/tasks/klevu-task"
import { resolveSourceInput } from "../utils/resolve-source-input"
import { GatheredOptions } from "../utils/types"
import { schematicOptionPrompts } from "./prompts"

export function createD2CCommand(
  ctx: CommandContext,
): yargs.CommandModule<GenerateCommandArguments, D2CCommandArguments> {
  return {
    command: ["d2c [location]", "$0 [location]"],
    aliases: ["storefront"],
    describe: "generate Elastic Path storefront",
    builder: async (yargs) => {
      const result = yargs
        .middleware(createTTYCheckMiddleware(ctx))
        .middleware(createAuthenticationCheckerMiddleware(ctx))
        .middleware(createActiveStoreMiddleware(ctx))
        .positional("location", {
          describe: "the location for this storefront project",
          type: "string",
        })
        .option("pkg-manager", {
          describe: "node package manager to use",
          choices: ["npm", "yarn", "pnpm", "bun"] as const,
        })
        .fail(false)
        .help()
        .parserConfiguration({
          "camel-case-expansion": false,
          "dot-notation": false,
          "boolean-negation": true,
          "strip-aliased": true,
        })

      const collectionName = resolveD2CCollectionName(
        process.env.NODE_ENV ?? "production",
      )

      const workflow = await getOrCreateWorkflowForBuilder(
        collectionName,
        "",
        "",
      )
      const collection = workflow.engine.createCollection(collectionName)

      const schematicsNamesForOptions = [
        "d2c",
        "cart",
        "checkout",
        "product-details-page",
        "product-list-page",
        "product-list-page-algolia",
        "product-list-page-klevu",
        "header",
        "footer",
        "home",
        "setup-payment-gateway",
        "ep-payments-payment-gateway",
      ]

      const options = await getAllD2CSchematicOptions(
        collection,
        workflow,
        schematicsNamesForOptions,
      )

      return addSchemaOptionsToCommand(result, options)
    },
    handler: ctx.handleErrors(
      trackCommandHandler(ctx, createD2CCommandHandler),
    ),
  }
}

async function getAllD2CSchematicOptions(
  collection: Collection<
    FileSystemCollectionDescription,
    FileSystemSchematicDescription
  >,
  workflow: NodeWorkflow,
  schematicName: string[],
): Promise<Option[]> {
  return schematicName.reduce(
    async (acc, schematicName) => {
      const values = await acc
      const latestOptions = await getSchematicOptions(
        collection,
        schematicName,
        workflow,
      )

      return [...combineOptions(values, latestOptions)]
    },
    Promise.resolve([]) as Promise<Option[]>,
  )
}

function combineOptions(arr1: Option[], arr2: Option[]): Option[] {
  const combinedOptions: Option[] = []

  // Create a map to keep track of unique names
  const uniqueNames = new Map<string, boolean>()

  // Add options from the first array
  for (const option of arr1) {
    if (!uniqueNames.has(option.name)) {
      uniqueNames.set(option.name, true)
      combinedOptions.push(option)
    }
  }

  // Add options from the second array
  for (const option of arr2) {
    if (!uniqueNames.has(option.name)) {
      uniqueNames.set(option.name, true)
      combinedOptions.push(option)
    }
  }

  return combinedOptions
}

export function createD2CCommandHandler(
  ctx: CommandContext,
): CommandHandlerFunction<
  D2CCommandData,
  D2CCommandError,
  D2CCommandArguments
> {
  const { store } = ctx

  return async function generateCommandHandler(args) {
    const colors = ansiColors.create()

    const detectedPkgManager = await detect()

    const { cliOptions, schematicOptions, _, location, pkgManager } = parseArgs(
      args,
      detectedPkgManager,
    )

    /** Create the DevKit Logger used through the CLI. */
    const logger = createConsoleLogger(
      !!cliOptions.verbose,
      ctx.stdout,
      ctx.stderr,
      {
        info: (s) => s,
        debug: (s) => s,
        warn: (s) => colors.bold.yellow(s),
        error: (s) => colors.bold.red(s),
        fatal: (s) => colors.bold.red(s),
      },
    )

    logger.debug(`Cli Options: ${JSON.stringify(cliOptions)}`)
    logger.debug(`Schematic Options: ${JSON.stringify(schematicOptions)}`)

    const collectionName = resolveD2CCollectionName(
      process.env.NODE_ENV ?? "production",
    )
    const schematicName = "d2c"

    const isLocalCollection =
      collectionName.startsWith(".") || collectionName.startsWith("/")

    /** Gather the arguments for later use. */
    const debugPresent = cliOptions.debug !== null
    const debug = debugPresent ? !!cliOptions.debug : isLocalCollection
    const dryRunPresent = cliOptions["dry-run"] !== null
    const dryRun = dryRunPresent ? !!cliOptions["dry-run"] : debug
    const force = !!cliOptions.force
    const allowPrivate = !!cliOptions["allow-private"]
    const skipGit = !!cliOptions["skip-git"]
    const skipInstall = !!cliOptions["skip-install"]
    const skipConfig = !!cliOptions["skip-config"]

    let gatheredOptions: GatheredOptions = {
      location,
    }

    if (cliOptions.interactive && isTTY()) {
      // check if user is authenticated
      const creds = getCredentials(store)

      if (creds.success) {
        // User entered path to project
        const resolvedLocation = location ?? (await promptForProjectLocation())
        const projectLocation = extractProjectLocation(resolvedLocation)

        // Check if project folder already exists
        const projectFolderExists = await exists(projectLocation.directory)

        if (projectFolderExists) {
          const message =
            outputContent`A folder with the name ${outputToken.path(
              projectLocation.location,
            )} already exists. Please remove it or choose a different project name.`
              .value

          renderError({
            headline: "Project folder exists",
            body: message,
          })
          return {
            success: false,
            error: {
              code: "project-folder-exists",
              message,
            },
          }
        }

        const activeStore = await getStore(store)

        if (!activeStore.success) {
          return {
            success: false,
            error: {
              code: "active-store-not-found",
              message: activeStore.error.message,
            },
          }
        }

        const switchResult = await selectStoreById(
          store,
          ctx.requester,
          activeStore.data.id,
        )

        if (!switchResult.success) {
          return {
            success: false,
            error: {
              code: "active-store-switch-failed",
              message: switchResult.error.message,
            },
          }
        }

        const kebabCaseName = paramCase(projectLocation.name)

        const createResult = await createApplicationKeys(
          ctx.requester,
          `${kebabCaseName}-${new Date().toISOString()}`,
        )

        if (!createResult.success) {
          return {
            success: false,
            error: {
              code: "application-keys-creation-failed",
              message: createResult.error.message,
            },
          }
        }

        const { client_id, client_secret } = createResult.data

        gatheredOptions = {
          ...gatheredOptions,
          epccClientId: client_id,
          epccClientSecret: client_secret,
          location: projectLocation.location,
          name: projectLocation.name,
          directory: projectLocation.directory,
        }
      }

      const regionResult = getRegion(store)

      if (!regionResult.success) {
        return {
          success: false,
          error: {
            code: "region-not-found",
            message: regionResult.error.message,
          },
        }
      }

      const apiHost = new URL(resolveHostFromRegion(regionResult.data)).host

      gatheredOptions = {
        ...gatheredOptions,
        epccEndpointUrl: apiHost,
      }

      const additionalOptions = await schematicOptionPrompts()

      gatheredOptions = {
        ...gatheredOptions,
        ...additionalOptions.plp,
        ...additionalOptions.paymentGateway,
      }
    }

    /**
     * Root at which the workflow will be executed.
     */
    const workflowRoot =
      gatheredOptions.directory?.substring(
        0,
        gatheredOptions.directory?.lastIndexOf("/"),
      ) ?? process.cwd()

    /** Create the workflow scoped to the working directory that will be executed with this run. */
    const workflow = new NodeWorkflow(workflowRoot, {
      force,
      dryRun,
      resolvePaths: [__dirname, process.cwd(), workflowRoot],
      schemaValidation: true,
      engineHostCreator: (options) =>
        new SchematicEngineHost(options.resolvePaths),
    })

    /** If the user wants to list schematics, we simply show all the schematic names. */
    if (cliOptions["list-schematics"]) {
      return _listSchematics(workflow, collectionName, logger)
    }

    if (debug) {
      renderInfo({
        body: `Debug mode enabled${
          isLocalCollection ? " by default for local collections" : ""
        }.`,
      })
    }

    // Indicate to the user when nothing has been done. This is automatically set to off when there's
    // a new DryRunEvent.
    let nothingDone = true

    // Logging queue that receives all the messages to show the users. This only get shown when no
    // errors happened.
    let loggingQueue: string[] = []
    let error = false

    /**
     * Logs out dry run events.
     *
     * All events will always be executed here, in order of discovery. That means that an error would
     * be shown along other events when it happens. Since errors in workflows will stop the Observable
     * from completing successfully, we record any events other than errors, then on completion we
     * show them.
     *
     * This is a simple way to only show errors when an error occur.
     */

    workflow.reporter.subscribe((event) => {
      nothingDone = false
      // Strip leading slash to prevent confusion.
      const eventPath = event.path.startsWith("/")
        ? event.path.slice(1)
        : event.path

      if (dryRun) {
        switch (event.kind) {
          case "error":
            error = true

            const desc =
              event.description == "alreadyExist"
                ? "already exists"
                : "does not exist"
            logger.error(`ERROR! ${eventPath} ${desc}.`)
            break
          case "update":
            loggingQueue.push(
              `${colors.cyan("UPDATE")} ${eventPath} (${
                event.content.length
              } bytes)`,
            )
            break
          case "create":
            loggingQueue.push(
              `${colors.green("CREATE")} ${eventPath} (${
                event.content.length
              } bytes)`,
            )
            break
          case "delete":
            loggingQueue.push(`${colors.yellow("DELETE")} ${eventPath}`)
            break
          case "rename":
            const eventToPath = event.to.startsWith("/")
              ? event.to.slice(1)
              : event.to
            loggingQueue.push(
              `${colors.blue("RENAME")} ${eventPath} => ${eventToPath}`,
            )
            break
        }
      }
    })

    /**
     * Listen to lifecycle events of the workflow to flush the logs between each phases.
     */
    workflow.lifeCycle.subscribe((event) => {
      if (event.kind == "workflow-end" || event.kind == "post-tasks-start") {
        if (!error) {
          // Flush the log queue and clean the error state.
          loggingQueue.forEach((log) => logger.info(log))
        }

        loggingQueue = []
        error = false
      }
    })

    // Show usage of deprecated options
    workflow.registry.useXDeprecatedProvider((msg) => logger.warn(msg))

    // Pass the rest of the arguments as the smart default "argv". Then delete it.
    workflow.registry.addSmartDefaultProvider("argv", (schema) =>
      "index" in schema ? _[Number(schema["index"])] : _,
    )

    // Add prompts.
    if (cliOptions.interactive && isTTY()) {
      workflow.registry.usePromptProvider(_createPromptProvider())
    }

    let unsubscribe: (() => void)[] = []

    /**
     *  Execute the workflow, which will report the dry run events, run the tasks, and complete
     *  after all is done.
     *
     *  The Observable returned will properly cancel the workflow if unsubscribed, error out if ANY
     *  step of the workflow failed (sink or task), with details included, and will only complete
     *  when everything is done.
     */
    try {
      await workflow
        .execute({
          collection: collectionName,
          schematic: schematicName,
          options: {
            ...schematicOptions,
            skipGit,
            skipInstall,
            skipConfig,
            packageManager: pkgManager,
            ...gatheredOptions,
            directory: "",
          },
          allowPrivate: allowPrivate,
          debug: debug,
          logger: logger,
        })
        .toPromise()

      if (nothingDone) {
        logger.info("Nothing to be done.")
      } else if (dryRun) {
        logger.info(
          `Dry run enabled${
            dryRunPresent ? "" : " by default in debug mode"
          }. No files written to disk.`,
        )
      } else {
        const updatedCtx = await getUpdatedCtx(
          ctx,
          gatheredOptions.location ?? "unknown-project-name",
        )

        const d2cSetupTasks = createD2CSetupTask()

        if (!updatedCtx.epClient) {
          throw Error("epClient is not defined can't run d2c setup task")
        }

        if (!updatedCtx.workspaceRoot) {
          throw Error("workspaceRoot is not defined can't run d2c setup task")
        }

        if (gatheredOptions.plpType === "Algolia") {
          d2cSetupTasks.add([
            {
              title: "Algolia configuration",
              task: createAlgoliaTask({ unsubscribe }) as any,
            },
          ])
        } else if (gatheredOptions.plpType === "Klevu") {
          d2cSetupTasks.add([
            {
              title: "Klevu configuration",
              task: createKlevuTask({ unsubscribe }) as any,
            },
          ])
        }

        if (gatheredOptions.paymentGatewayType === "Manual") {
          d2cSetupTasks.add([
            {
              title: "Simple checkout (Manual Gateway) setup",
              task: createManualTasks,
            },
          ])
        }

        if (gatheredOptions.paymentGatewayType === "EP Payments") {
          d2cSetupTasks.add([
            {
              title: "EP Payments setup",
              task: createEPPaymentTasks,
            },
          ])
        }

        const confData = await resolveConfStoreData(store)

        if (!confData.success) {
          return {
            success: false,
            error: {
              code: "conf-data-not-found",
              message: confData.error.message,
            },
          }
        }

        if (skipConfig) {
          renderWarning({
            body: "You skipped configuration",
          })
          renderProjectReady({
            projectName: gatheredOptions.location,
            pkgManager,
            notes: [],
          })
        } else {
          renderInfo({
            body: outputContent`Performing setup`.value,
          })
          const result = await d2cSetupTasks.run({
            client: updatedCtx.epClient,
            workspaceRoot: updatedCtx.workspaceRoot,
            accountId: gatheredOptions.epPaymentsStripeAccountId,
            publishableKey: gatheredOptions.epPaymentsStripePublishableKey,
            sourceInput: resolveSourceInput(gatheredOptions, confData.data),
            config: confData.data,
            requester: ctx.requester,
            skipGit,
            skipConfig,
          })

          const notes = processResultNotes(result)

          renderProjectReady({
            projectName: gatheredOptions.location,
            pkgManager,
            notes,
          })
        }
      }

      return {
        success: true,
        data: {},
      }
    } catch (err) {
      if (err instanceof UnsuccessfulWorkflowExecution) {
        // "See above" because we already printed the error.
        logger.fatal("The Schematic workflow failed. See above.")
      } else if (debug && err instanceof Error) {
        logger.fatal(`An error occured:\n${err.stack}`)
      } else {
        logger.fatal(
          `Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`,
        )
      }

      return {
        success: false,
        error: {
          code: "schematic-workflow-failed",
          message: "The Schematic workflow failed.",
        },
      }
    } finally {
      unsubscribe.forEach((unsubFn) => unsubFn())
    }
  }
}

type Note = { title: string; description: string }

type ProjectLocation = {
  /**
   * User entered project location
   */
  location: string
  /**
   * Absolute path to the project location
   */
  directory: string
  /**
   * Name of the project
   */
  name: string
}

function extractProjectLocation(location: string): ProjectLocation {
  const directory = resolvePath(process.cwd(), location)
  const name = basename(location)

  return {
    location,
    directory,
    name,
  }
}

function processResultNotes(result: D2CSetupTaskContext): Note[] {
  const colors = ansiColors.create()
  let notes: { title: string; description: string }[] = []

  if (result.epPaymentGatewaySetup) {
    notes.push({
      title: `${colors.bold.green(
        "The EP Payments integration was already setup",
      )}`,
      description: `It was using the account id ${
        result.accountId ?? "unknown"
      }\nDon't forget to add your EP Payment variables to .env.local \nNEXT_PUBLIC_STRIPE_ACCOUNT_ID=${
        result.accountId
      }\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>`,
    })
  }

  return notes
}

/** Parse the command line. */
const booleanArgs = [
  "allow-private",
  "debug",
  "dry-run",
  "force",
  "help",
  "list-schematics",
  "verbose",
  "interactive",
  "skip-install",
  "skip-git",
  "skip-config",
] as const

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never

interface Options {
  _: string[]
  schematicOptions: Record<string, unknown>
  cliOptions: Partial<Record<ElementType<typeof booleanArgs>, boolean | null>>
  location: string | null
  workspace: string | null
  root: string | null
  pkgManager: "npm" | "yarn" | "pnpm" | "bun"
}

/** Parse the command line. */
function parseArgs(
  args: yargs.ArgumentsCamelCase<D2CCommandArguments>,
  detectedPkgManager?: "npm" | "yarn" | "pnpm" | "bun",
): Options {
  const { _, $0, location = null, ...options } = args

  // Camelize options as yargs will return the object in kebab-case when camel casing is disabled.
  const schematicOptions: Options["schematicOptions"] = {}
  const cliOptions: Options["cliOptions"] = {}

  const isCliOptions = (
    key: ElementType<typeof booleanArgs> | string,
  ): key is ElementType<typeof booleanArgs> =>
    booleanArgs.includes(key as ElementType<typeof booleanArgs>)

  for (const [key, value] of Object.entries(options)) {
    if (/[A-Z]/.test(key)) {
      throw new Error(
        `Unknown argument ${key}. Did you mean ${decamelize(key)}?`,
      )
    }

    if (isCliOptions(key)) {
      // @ts-ignore TODO: fix this
      cliOptions[key] = value
    } else {
      schematicOptions[camelCase(key)] = value
    }
  }

  return {
    _: _.map((v) => v.toString()),
    schematicOptions,
    cliOptions,
    location,
    workspace: location,
    root: location,
    pkgManager: args["pkg-manager"] ?? detectedPkgManager ?? "npm",
  }
}

function _listSchematics(
  workflow: NodeWorkflow,
  collectionName: string,
  logger: logging.Logger,
): CommandResult<D2CCommandData, D2CCommandError> {
  try {
    logger.info(`collection listed for: ${collectionName}`)
    const collection = workflow.engine.createCollection(collectionName)
    logger.info(collection.listSchematicNames().join("\n"))
  } catch (error) {
    logger.fatal(error instanceof Error ? error.message : `${error}`)

    return {
      success: false,
      error: {
        code: "invalid-collection",
        message: `Invalid collection (${collectionName}).`,
      },
    }
  }

  return {
    success: true,
    data: {},
  }
}

function _createPromptProvider(): schema.PromptProvider {
  return (definitions) => {
    const questions: inquirer.QuestionCollection = definitions.map(
      (definition) => {
        const question: inquirer.Question = {
          name: definition.id,
          message: definition.message,
          default: definition.default,
        }

        const validator = definition.validator
        if (validator) {
          question.validate = (input) => validator(input)
        }

        switch (definition.type) {
          case "confirmation":
            return { ...question, type: "confirm" }
          case "list":
            return {
              ...question,
              type: definition.multiselect ? "checkbox" : "list",
              choices:
                definition.items &&
                definition.items.map((item) => {
                  if (typeof item == "string") {
                    return item
                  } else {
                    return {
                      name: item.label,
                      value: item.value,
                    }
                  }
                }),
            }
          default:
            return { ...question, type: definition.type }
        }
      },
    )

    return inquirer.prompt(questions)
  }
}

export async function getUpdatedCtx(ctx: CommandContext, projectName: string) {
  return {
    ...ctx,
    workspaceRoot: projectName,
  }
}

async function promptForProjectLocation(): Promise<string> {
  const { location: promptedLocation } = await inquirer.prompt([
    {
      type: "input",
      name: "location",
      message: "Where do you want to output your project?",
      default: "elastic-path-storefront",
    },
  ])

  return promptedLocation
}

function renderProjectReady({
  pkgManager,
  projectName,
  notes,
}: {
  projectName?: string | null
  pkgManager: Exclude<D2CCommandArguments["pkg-manager"], undefined>
  notes: Array<{ title: string; description: string }>
}) {
  const bodyLines: [string, string][] = []

  if (projectName) {
    bodyLines.push(["Elastic Path store", projectName])
  }

  bodyLines.push(["Framework", "Next.js"])

  const padMin =
    1 + bodyLines.reduce((max, [label]) => Math.max(max, label.length), 0)

  renderSuccess({
    headline: `Storefront generated`,
    body: bodyLines
      .map(
        ([label, value]) =>
          `  ${(label + ":").padEnd(padMin, " ")}  ${chalk.dim(value)}`,
      )
      .join("\n"),
    customSections: [
      {
        title: "Help\n",
        body: {
          list: {
            items: [
              {
                link: {
                  label: "Documentation",
                  url: "https://elasticpath.dev/docs",
                },
              },
              {
                link: {
                  label: "Demo stores",
                  url: "https://demo.elasticpath.com",
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
                    command: outputContent`${outputToken.genericShellCommand(
                      [
                        "" === process.cwd()
                          ? undefined
                          : `cd ${projectName?.replace(/^\.\//, "")}`,
                        false ? undefined : `${pkgManager} install`,
                        formatPackageManagerCommand(pkgManager, "dev"),
                      ]
                        .filter(Boolean)
                        .join(" && "),
                    )}`.value,
                  },
                ],
                ...notes.map((note) => {
                  return [note.title, note.description]
                }),
              ].filter((step): step is string[] => Boolean(step)),
            },
          },
        ],
      },
      {
        title: "Deployment\n",
        body: [
          {
            list: {
              items: [
                {
                  link: {
                    label: "Vercel",
                    url: "https://nextjs.org/learn-pages-router/basics/deploying-nextjs-app/deploy",
                  },
                },
                {
                  link: {
                    label: "Netlify",
                    url: "https://www.netlify.com/with/nextjs/",
                  },
                },
              ],
            },
          },
        ],
      },
    ].filter((step): step is { title: string; body: any } => Boolean(step)),
  })
}

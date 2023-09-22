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
import { handleErrors } from "../../../util/error-handler"
import { resolveHostFromRegion } from "../../../util/resolve-region"
import { getToken } from "../../../lib/authentication/get-token"
import { createApplicationKeys } from "../../../util/create-client-secret"
import { renderInk } from "../../../lib/ink/render-ink"
import React from "react"
import { D2CGenerated } from "../../ui/generate/d2c-generated"
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
} from "../generate-command"

export function createD2CCommand(
  ctx: CommandContext
): yargs.CommandModule<GenerateCommandArguments, D2CCommandArguments> {
  return {
    command: "d2c [name]",
    aliases: ["storefront"],
    describe: "generate Elasticpath storefront",
    builder: async (yargs) => {
      const result = yargs
        .middleware(createAuthenticationCheckerMiddleware(ctx))
        .middleware(createActiveStoreMiddleware(ctx))
        .positional("name", {
          describe: "the name for this storefront project",
          type: "string",
        })
        .option("pkg-manager", {
          describe: "node package manager to use",
          choices: ["npm", "yarn", "pnpm"] as const,
          default: "npm" as const,
        })
        .help()
        .parserConfiguration({
          "camel-case-expansion": false,
          "dot-notation": false,
          "boolean-negation": true,
          "strip-aliased": true,
        })

      const collectionName = resolveD2CCollectionName(
        process.env.NODE_ENV ?? "production"
      )
      const workflow = await getOrCreateWorkflowForBuilder(
        collectionName,
        "",
        ""
      ) // TODO: add real root and workspace
      const collection = workflow.engine.createCollection(collectionName)

      const schematicsNamesForOptions = [
        "d2c",
        "cart",
        "checkout",
        "product-details-page",
        "product-list-page",
        "product-list-page-algolia",
        "header",
        "footer",
        "home",
        "setup-payment-gateway",
        "ep-payments-payment-gateway",
      ]

      const options = await getAllD2CSchematicOptions(
        collection,
        workflow,
        schematicsNamesForOptions
      )

      return addSchemaOptionsToCommand(result, options)
    },
    handler: handleErrors(trackCommandHandler(ctx, createD2CCommandHandler)),
  }
}

async function getAllD2CSchematicOptions(
  collection: Collection<
    FileSystemCollectionDescription,
    FileSystemSchematicDescription
  >,
  workflow: NodeWorkflow,
  schematicName: string[]
): Promise<Option[]> {
  return schematicName.reduce(async (acc, schematicName) => {
    const values = await acc
    const latestOptions = await getSchematicOptions(
      collection,
      schematicName,
      workflow
    )

    return [...combineOptions(values, latestOptions)]
  }, Promise.resolve([]) as Promise<Option[]>)
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
  ctx: CommandContext
): CommandHandlerFunction<
  D2CCommandData,
  D2CCommandError,
  D2CCommandArguments
> {
  const { store } = ctx

  return async function generateCommandHandler(args) {
    const colors = ansiColors.create()

    const { cliOptions, schematicOptions, _, name, pkgManager } =
      parseArgs(args)

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
      }
    )

    logger.debug(`Cli Options: ${JSON.stringify(cliOptions)}`)
    logger.debug(`Schematic Options: ${JSON.stringify(schematicOptions)}`)

    const collectionName = resolveD2CCollectionName(
      process.env.NODE_ENV ?? "production"
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

    /** Create the workflow scoped to the working directory that will be executed with this run. */
    const workflow = new NodeWorkflow(process.cwd(), {
      force,
      dryRun,
      resolvePaths: [process.cwd(), __dirname],
      schemaValidation: true,
    })

    /** If the user wants to list schematics, we simply show all the schematic names. */
    if (cliOptions["list-schematics"]) {
      return _listSchematics(workflow, collectionName, logger)
    }

    if (debug) {
      logger.info(
        `Debug mode enabled${
          isLocalCollection ? " by default for local collections" : ""
        }.`
      )
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
            } bytes)`
          )
          break
        case "create":
          loggingQueue.push(
            `${colors.green("CREATE")} ${eventPath} (${
              event.content.length
            } bytes)`
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
            `${colors.blue("RENAME")} ${eventPath} => ${eventToPath}`
          )
          break
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
      "index" in schema ? _[Number(schema["index"])] : _
    )

    // Add prompts.
    if (cliOptions.interactive && isTTY()) {
      workflow.registry.usePromptProvider(_createPromptProvider())
    }

    let gatheredOptions: Record<string, any> = {
      name,
    }

    if (cliOptions.interactive && isTTY()) {
      // check if user is authenticated
      const creds = store.get("credentials") as Record<string, any> | undefined

      if (creds) {
        const apiUrl = resolveHostFromRegion(store.get("region") as any)
        const tokenResult = await getToken(apiUrl, store)

        if (tokenResult.success) {
          const token = tokenResult.data

          let resolvedName = name

          if (!resolvedName) {
            const { name: promptedName } = await inquirer.prompt([
              {
                type: "input",
                name: "name",
                message: "What do you want to call the project?",
              },
            ])

            resolvedName = promptedName
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

          const switchResult = await selectStoreById(store, activeStore.data.id)

          if (!switchResult.success) {
            return {
              success: false,
              error: {
                code: "active-store-switch-failed",
                message: switchResult.error.message,
              },
            }
          }

          const { data } = await createApplicationKeys(
            apiUrl,
            token,
            `${resolvedName}-${new Date().toISOString()}`
          )

          gatheredOptions = {
            ...gatheredOptions,
            epccClientId: data.client_id,
            epccClientSecret: data.client_secret,
            name: resolvedName,
          }
        }
      }

      const region = store.get("region") as any

      const apiHost = new URL(resolveHostFromRegion(region)).host

      gatheredOptions = {
        ...gatheredOptions,
        epccEndpointUrl: apiHost,
      }
    }

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
            ...gatheredOptions,
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
          }. No files written to disk.`
        )
      } else {
        await renderInk(
          React.createElement(D2CGenerated, {
            skipInstall,
            name: (gatheredOptions as any).name,
            nodePkgManager: pkgManager,
          })
        )
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
          `Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`
        )
      }

      return {
        success: false,
        error: {
          code: "schematic-workflow-failed",
          message: "The Schematic workflow failed.",
        },
      }
    }
  }
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
  name: string | null
  pkgManager: "npm" | "yarn" | "pnpm"
}

/** Parse the command line. */
function parseArgs(
  args: yargs.ArgumentsCamelCase<D2CCommandArguments>
): Options {
  const { _, $0, name = null, ...options } = args

  // Camelize options as yargs will return the object in kebab-case when camel casing is disabled.
  const schematicOptions: Options["schematicOptions"] = {}
  const cliOptions: Options["cliOptions"] = {}

  const isCliOptions = (
    key: ElementType<typeof booleanArgs> | string
  ): key is ElementType<typeof booleanArgs> =>
    booleanArgs.includes(key as ElementType<typeof booleanArgs>)

  for (const [key, value] of Object.entries(options)) {
    if (/[A-Z]/.test(key)) {
      throw new Error(
        `Unknown argument ${key}. Did you mean ${decamelize(key)}?`
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
    name,
    pkgManager: args["pkg-manager"],
  }
}

function _listSchematics(
  workflow: NodeWorkflow,
  collectionName: string,
  logger: logging.Logger
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
      }
    )

    return inquirer.prompt(questions)
  }
}

#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// symbol polyfill must go first
import "symbol-observable"
import { logging, schema, tags } from "@angular-devkit/core"
import { ProcessOutput, createConsoleLogger } from "@angular-devkit/core/node"
import { UnsuccessfulWorkflowExecution } from "@angular-devkit/schematics"
import { NodeWorkflow } from "@angular-devkit/schematics/tools"
import * as ansiColors from "ansi-colors"
import * as inquirer from "inquirer"
import yargsParser, { camelCase, decamelize } from "yargs-parser"

/**
 * Parse the name of schematic passed in argument, and return a {collection, schematic} named
 * tuple. The user can pass in `collection-name:schematic-name`, and this function will either
 * return `{collection: 'collection-name', schematic: 'schematic-name'}`, or it will error out
 * and show usage.
 *
 * In the case where a collection name isn't part of the argument, the default is to use the
 * schematics package (@field123/epcc-schematics-cli) as the collection.
 *
 * This logic is entirely up to the tooling.
 *
 * @param str The argument to parse.
 * @return {{collection: string, schematic: (string)}}
 */
function parseSchematicName(
  str: string | null
): {
  collection: string
  schematic: string | null
} {
  let collection = "@elasticpath/d2c-schematics"

  let schematic = str
  if (schematic?.includes(":")) {
    const lastIndexOfColon = schematic.lastIndexOf(":")
    ;[collection, schematic] = [
      schematic.slice(0, lastIndexOfColon),
      schematic.substring(lastIndexOfColon + 1)
    ]
  }

  return { collection, schematic }
}

export interface MainOptions {
  args: string[]
  stdout?: ProcessOutput
  stderr?: ProcessOutput
}

function _listSchematics(
  workflow: NodeWorkflow,
  collectionName: string,
  logger: logging.Logger
) {
  try {
    logger.info(`collection listed for: ${collectionName}`)
    const collection = workflow.engine.createCollection(collectionName)
    logger.info(collection.listSchematicNames().join("\n"))
  } catch (error) {
    logger.fatal(error instanceof Error ? error.message : `${error}`)

    return 1
  }

  return 0
}

function _createPromptProvider(): schema.PromptProvider {
  return definitions => {
    const questions: inquirer.QuestionCollection = definitions.map(
      definition => {
        const question: inquirer.Question = {
          name: definition.id,
          message: definition.message,
          default: definition.default
        }

        const validator = definition.validator
        if (validator) {
          question.validate = input => validator(input)
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
                definition.items.map(item => {
                  if (typeof item == "string") {
                    return item
                  } else {
                    return {
                      name: item.label,
                      value: item.value
                    }
                  }
                })
            }
          default:
            return { ...question, type: definition.type }
        }
      }
    )

    return inquirer.prompt(questions)
  }
}

// eslint-disable-next-line max-lines-per-function
export async function main({
  args,
  stdout = process.stdout,
  stderr = process.stderr
}: MainOptions): Promise<0 | 1> {
  const { cliOptions, schematicOptions, _ } = parseArgs(args)
  console.log("schematic options: ", schematicOptions, cliOptions)
  // Create a separate instance to prevent unintended global changes to the color configuration
  const colors = ansiColors.create()

  /** Create the DevKit Logger used through the CLI. */
  const logger = createConsoleLogger(!!cliOptions.verbose, stdout, stderr, {
    info: s => s,
    debug: s => s,
    warn: s => colors.bold.yellow(s),
    error: s => colors.bold.red(s),
    fatal: s => colors.bold.red(s)
  })

  if (cliOptions.help) {
    logger.info(getUsage())

    return 0
  }

  /** Get the collection an schematic name from the first argument. */
  const {
    collection: collectionName,
    schematic: schematicName
  } = parseSchematicName(_.shift() || null)

  console.log("collection and scehamtic: ", collectionName, schematicName)

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

  console.log("process.cwd(): ", process.cwd())
  console.log("__dirname: ", __dirname)

  const temp = require.resolve("@field123/epcc-schematics-cli/package.json")
  console.log("temp: ", temp)

  /** Create the workflow scoped to the working directory that will be executed with this run. */
  const workflow = new NodeWorkflow(process.cwd(), {
    force,
    dryRun,
    resolvePaths: [process.cwd(), __dirname],
    schemaValidation: true
  })

  /** If the user wants to list schematics, we simply show all the schematic names. */
  if (cliOptions["list-schematics"]) {
    return _listSchematics(workflow, collectionName, logger)
  }

  if (!schematicName) {
    logger.info(getUsage())

    return 1
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
  workflow.reporter.subscribe(event => {
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
  workflow.lifeCycle.subscribe(event => {
    if (event.kind == "workflow-end" || event.kind == "post-tasks-start") {
      if (!error) {
        // Flush the log queue and clean the error state.
        loggingQueue.forEach(log => logger.info(log))
      }

      loggingQueue = []
      error = false
    }
  })

  // Show usage of deprecated options
  workflow.registry.useXDeprecatedProvider(msg => logger.warn(msg))

  // Pass the rest of the arguments as the smart default "argv". Then delete it.
  workflow.registry.addSmartDefaultProvider("argv", schema =>
    "index" in schema ? _[Number(schema["index"])] : _
  )

  // Add prompts.
  if (cliOptions.interactive && isTTY()) {
    workflow.registry.usePromptProvider(_createPromptProvider())
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
        options: { ...schematicOptions, skipGit, skipInstall },
        allowPrivate: allowPrivate,
        debug: debug,
        logger: logger
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
    }

    return 0
  } catch (err) {
    if (err instanceof UnsuccessfulWorkflowExecution) {
      // "See above" because we already printed the error.
      logger.fatal("The Schematic workflow failed. See above.")
    } else if (debug && err instanceof Error) {
      logger.fatal(`An error occured:\n${err.stack}`)
    } else {
      console.log("magic error: ", err)
      logger.fatal(`Error: ${err instanceof Error ? err.message : err}`)
    }

    return 1
  }
}

/**
 * Get usage of the CLI tool.
 */
function getUsage(): string {
  return tags.stripIndent`
  schematics [collection-name:]schematic-name [options, ...]

  By default, if the collection name is not specified, use the internal collection provided
  by the Schematics CLI.

  Options:
      --debug             Debug mode. This is true by default if the collection is a relative
                          path (in that case, turn off with --debug=false).

      --allow-private     Allow private schematics to be run from the command line. Default to
                          false.

      --dry-run           Do not output anything, but instead just show what actions would be
                          performed. Default to true if debug is also true.

      --force             Force overwriting files that would otherwise be an error.

      --list-schematics   List all schematics from the collection, by name. A collection name
                          should be suffixed by a colon. Example: '@angular-devkit/schematics-cli:'.

      --no-interactive    Disables interactive input prompts.

      --verbose           Show more information.

      --help              Show this message.

  Any additional option is passed to the Schematics depending on its schema.
  `
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
  "skip-git"
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
}

/** Parse the command line. */
function parseArgs(args: string[]): Options {
  const { _, ...options } = yargsParser(args, {
    boolean: (booleanArgs as unknown) as string[],
    default: {
      interactive: true,
      debug: null,
      "dry-run": null
    },
    configuration: {
      "dot-notation": false,
      "boolean-negation": true,
      "strip-aliased": true,
      "camel-case-expansion": false
    }
  })

  console.log("options inside parseArgs: ", options, args)

  // Camelize options as yargs will return the object in kebab-case when camel casing is disabled.
  const schematicOptions: Options["schematicOptions"] = {}
  const cliOptions: Options["cliOptions"] = {}

  const isCliOptions = (
    key: ElementType<typeof booleanArgs> | string
  ): key is ElementType<typeof booleanArgs> =>
    booleanArgs.includes(key as ElementType<typeof booleanArgs>)

  console.log("entries: ", options)

  for (const [key, value] of Object.entries(options)) {
    if (/[A-Z]/.test(key)) {
      throw new Error(
        `Unknown argument ${key}. Did you mean ${decamelize(key)}?`
      )
    }

    if (isCliOptions(key)) {
      cliOptions[key] = value
    } else {
      schematicOptions[camelCase(key)] = value
    }
  }

  return {
    _: _.map(v => v.toString()),
    schematicOptions,
    cliOptions
  }
}

function isTTY(): boolean {
  const isTruthy = (value: undefined | string) => {
    // Returns true if value is a string that is anything but 0 or false.
    return (
      value !== undefined && value !== "0" && value.toUpperCase() !== "FALSE"
    )
  }

  // If we force TTY, we always return true.
  const force = process.env["NG_FORCE_TTY"]
  if (force !== undefined) {
    return isTruthy(force)
  }

  return !!process.stdout.isTTY && !isTruthy(process.env["CI"])
}

if (require.main === module) {
  const args = process.argv.slice(2)
  main({ args })
    .then(exitCode => (process.exitCode = exitCode))
    .catch(e => {
      throw e
    })
}

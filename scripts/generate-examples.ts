#!/usr/bin/env ts-node

import appRoot from "app-root-path"
import dotenv from "dotenv"
import fs from "node:fs"
/**
 * Load .env.example
 */
dotenv.config({ path: `${appRoot.path}/.env.examples` })

import childProcess from "child_process"
import { rimraf } from "rimraf"
import { mkdirp } from "mkdirp"
import { createLogger, Logger } from "./util/simple-logger"
import kebabCase from "kebab-case"
import { configuration } from "./example-specs/configuration"

interface GenerateExampleOptions {}

const simpleLogger = createLogger()

async function generateExamples({}: GenerateExampleOptions = {}): Promise<
  { success: true } | { success: false }
> {
  const isWorkspaceReady = await prepareWorkspace(appRoot.path, simpleLogger)

  if (!isWorkspaceReady) {
    simpleLogger.log("Unable to prepare workspace.")
    return { success: false }
  }

  simpleLogger.log("Workspace prepared.")

  await runComposableCli(
    `${appRoot.path}/packages/composable-cli/dist/bin/composable.js`,
    ["generate", "d2c"],
    simpleLogger,
  )

  return {
    success: true,
  }
}

async function runComposableCli(
  composableCliPath: string,
  command: string[],
  logger: Logger,
): Promise<void> {
  const specs = configuration.specs

  const promise = specs.map((spec) => {
    return d2cGeneratorForSpec(composableCliPath, command, spec, logger).then(
      async () => {
        await updateWorkspaceDependencies(
          `${appRoot.path}/examples/${spec.name}`,
        )
      },
    )
  })

  await Promise.all(promise)
  logger.log(
    `Finished generating examples for ${specs.map((spec) => spec.name)}`,
  )
}

type Spec = (typeof configuration.specs)[number]

async function updateWorkspaceDependencies(path: string) {
  const data = JSON.parse(fs.readFileSync(`${path}/package.json`).toString())

  const deps = ["@elasticpath/react-shopper-hooks"]

  for (const dep of deps) {
    if (data["dependencies"][dep]) {
      data["dependencies"][dep] = "workspace:*"
    }
  }

  fs.writeFileSync(`${path}/package.json`, JSON.stringify(data, null, 2))
}

async function d2cGeneratorForSpec(
  composableCliPath: string,
  command: string[],
  spec: Spec,
  logger: Logger,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const args = specToArgs(spec.args)

    const process = await childProcess.fork(
      composableCliPath,
      [...command, spec.name, ...args, "--pkg-manager=pnpm"],
      {
        cwd: `${appRoot.path}/examples`,
        env: {
          // @ts-ignore
          NODE_ENV: "CI",
        },
      },
    )

    // listen for errors as they may prevent the exit event from firing
    process.on("error", function (err) {
      reject(err)
    })

    // execute the callback once the process has finished running
    process.on("exit", function (code) {
      if (code === 0) {
        logger.log(`Generated ${spec.name} example.`)
        resolve()
      }
      reject(new Error("exit code " + code))
    })
  })
}

function specToArgs(args: Spec["args"]): string[] {
  return Object.keys(args).reduce((result, key) => {
    const argKey = kebabCase(key)
    return [...result, `--${argKey}=${args[key]}`]
  }, [])
}

async function prepareWorkspace(
  rootPath: string,
  logger: Logger,
): Promise<boolean> {
  // Attempt to create examples folder
  const didCreatedDir = await mkdirp(`${appRoot.path}/examples`)
  if (didCreatedDir) {
    logger.log("CREATED directory examples.")
    return true
  } else {
    logger.log("ALREADY EXISTS examples directory already exists.")
    return await attemptCleanup(rootPath, logger)
  }
}

async function attemptCleanup(
  rootPath: string,
  logger: Logger,
): Promise<boolean> {
  const didCleanup = await rimraf(`${rootPath}/examples/*`, {
    glob: true,
  })

  if (didCleanup) {
    logger.log("CLEARED previous examples folder.")
    return true
  } else {
    logger.log("FAILED to clean up previous examples folder.")
    return false
  }
}

generateExamples()

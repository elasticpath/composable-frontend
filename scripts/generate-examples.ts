#!/usr/bin/env ts-node
import path, { dirname } from "path"
import util from "util"
import childProcess from "child_process"
import fs from "fs-extra"
import chalk from "chalk"
import globby, { GlobbyOptions } from "globby"
// @ts-ignore
import rimraf from "rimraf"
import appRoot from "app-root-path"
import { mkdirp } from "mkdirp"
import { createLogger, Logger } from "./util/simple-logger"

interface GenerateExampleOptions {}

const simpleLogger = createLogger()

async function generateExamples({}: GenerateExampleOptions = {}): Promise<
  { success: true } | { success: false }
> {
  /**
   * TODO
   *  X clear previous examples
   *  - generate new examples
   */
  const isWorkspaceReady = await prepareWorkspace(appRoot.path, simpleLogger)

  if (!isWorkspaceReady) {
    simpleLogger.log("Unable to prepare workspace.")
    return { success: false }
  }

  simpleLogger.log("Workspace prepared.")

  await runMasonCli(
    `${appRoot.path}/packages/mason-cli/dist/bin/mason.js`,
    `${appRoot.path}/packages/d2c-schematics/dist:d2c`
  )

  return {
    success: true,
  }
}

async function runMasonCli(
  masonCliPath: string,
  schematicPath: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const process = await childProcess.fork(
      masonCliPath,
      [
        schematicPath,
        "--dry-run=false",
        "--skip-install=true",
        "--skip-git=true",
        "--skip-config=true",
        "--interactive=false",
        "--epcc-client-id=$EPCC_CLIENT_ID",
        "--epcc-client-secret=$EPCC_CLIENT_SECRET",
        "--epcc-endpoint-url=$EPCC_ENDPOINT",
        "--plp-type=None",
        '--payment-gateway-type="EP Payments"',
        "--ep-payments-stripe-account-id=abc123",
        "--ep-payments-stripe-publishable-key=abc123",
        "basic",
      ],
      {
        cwd: `${appRoot.path}/examples`,
      }
    )
    // node ../packages/mason-cli/dist/bin/mason.js ../packages/d2c-schematics/dist:d2c --dry-run=false --skip-install=true --skip-git=true  --skip-config=true --interactive=false --epcc-client-id=$EPCC_CLIENT_ID --epcc-client-secret=$EPCC_CLIENT_SECRET --epcc-endpoint-url=$EPCC_ENDPOINT --plp-type=None --payment-gateway-type="EP Payments" --ep-payments-stripe-account-id=abc123 --ep-payments-stripe-publishable-key=abc123 basic'
    // listen for errors as they may prevent the exit event from firing
    process.on("error", function (err) {
      reject(err)
    })

    // execute the callback once the process has finished running
    process.on("exit", function (code) {
      if (code === 0) {
        resolve()
      }
      reject(new Error("exit code " + code))
    })
  })
}

function rimrafPromise(path: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    rimraf(path, (err: unknown) => {
      if (err) {
        return resolve(false)
      } else {
        return resolve(true)
      }
    })
  })
}

async function prepareWorkspace(
  rootPath: string,
  logger: Logger
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
  logger: Logger
): Promise<boolean> {
  const didCleanup = await rimrafPromise(`${rootPath}/examples/*`)
  if (didCleanup) {
    logger.log("CLEARED previous examples folder.")
    return true
  } else {
    logger.log("FAILED to clean up previous examples folder.")
    return false
  }
}

generateExamples()

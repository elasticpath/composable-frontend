import Conf from "conf"
import { Schema } from "conf/dist/source/types"
import { CommandContext } from "../types/command"
import fetch, { RequestInfo, RequestInit, Response } from "node-fetch"
import { getToken } from "../lib/authentication/get-token"
import { getRegion, resolveHostFromRegion } from "./resolve-region"
import path from "path"
import ws from "ws"
import { createConsoleLogger, ProcessOutput } from "@angular-devkit/core/node"
import * as ansiColors from "ansi-colors"
import { makeErrorWrapper } from "./error-handler"
import { renderInk } from "../lib/ink/render-ink"
import React from "react"
import { ErrorTable } from "../commands/ui/error/error"

// polyfill fetch & websocket
const globalAny = global as any
globalAny.AbortController = AbortController
globalAny.fetch = fetch
globalAny.WebSocket = ws

export const storeSchema = {
  credentials: {
    type: "object",
    properties: {
      access_token: { type: "string" },
      expires: { type: "number" },
      expires_in: { type: "number" },
      identifier: { type: "string" },
      refresh_token: { type: "string" },
      token_type: { type: "string" },
    },
  },
  region: {
    enum: ["eu-west", "us-east"],
    type: "string",
    default: "eu-west",
  },
}

export type EpccRequester = typeof fetch

export function createCommandContext({
  stdout,
  stderr,
  verbose,
}: {
  stdout?: ProcessOutput
  stderr?: ProcessOutput
  verbose?: boolean
}): CommandContext {
  const store = new Conf({
    projectName: "composable-cli",
    schema: storeSchema as Schema<Record<string, unknown>>,
  })

  const resolvedStdout = stdout ?? process.stdout
  const resolvedStderr = stderr ?? process.stderr

  const colors = ansiColors.create()

  /** Create the DevKit Logger used through the CLI. */
  const defaultLogger = createConsoleLogger(
    verbose ?? false,
    resolvedStdout,
    resolvedStderr,
    {
      info: (s) => s,
      debug: (s) => s,
      warn: (s) => colors.bold.yellow(s),
      error: (s) => colors.bold.red(s),
      fatal: (s) => colors.bold.red(s),
    },
  )

  return {
    store,
    requester: createRequester(store),
    rawRequester: fetch,
    stdout: resolvedStdout,
    stderr: resolvedStderr,
    logger: defaultLogger,
    colors,
    handleErrors: makeErrorWrapper(
      (err) => {
        if (err instanceof Error) {
          console.error(err.name)
          console.error(err.message)
          console.error(err.stack)
          console.error(err.cause)
          return Promise.resolve()
        }
        console.error("There was an unexpected error!")
        return Promise.resolve()
      },
      async (result) => {
        if (!result.success) {
          if (result.error instanceof Error) {
            console.error(`Error Code: ${result.error.name}`)
            console.error(`Error Message: ${result.error.message}`)
            console.error(`Error Stack: ${result.error.stack}`)
            console.error(`Error Cause: ${result.error.cause}`)
          } else if (isRecordStringAny(result.error)) {
            await renderInk(
              React.createElement(ErrorTable, { data: result.error }),
            )
          } else {
            console.warn(
              "Error was not an known error type! Could not parse a useful error message.",
            )
          }
        }
      },
      defaultLogger,
    ),
  }
}

function isRecordStringAny(obj: unknown): obj is Record<string, any> {
  return typeof obj === "object" && obj !== null
}

function createRequester(store: Conf): EpccRequester {
  return async function requester(
    url: RequestInfo,
    init?: RequestInit,
  ): Promise<Response> {
    const regionResult = getRegion(store)

    if (!regionResult.success) {
      throw new Error(
        `Failed to perform request, could not get region: ${regionResult.error.message}`,
      )
    }

    const apiUrl = resolveHostFromRegion(regionResult.data)

    const authHeader = await resolveAuthorizationHeader(store, apiUrl)

    // TODO: handle the fact `url` is a RequestInfo not just a plain string
    const completeUrl = path.join(apiUrl, url.toString())

    return fetch(completeUrl, {
      ...(init || {}),
      headers: {
        ...(init?.headers || {}),
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    })
  } as typeof fetch
}

async function resolveAuthorizationHeader(
  store: Conf,
  apiUrl: string,
): Promise<string | null> {
  const credentials = await getToken(apiUrl, store)

  if (!credentials.success) {
    return null
  }

  return `Bearer ${credentials.data}`
}

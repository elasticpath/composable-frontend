import Conf from "conf"
import { Schema } from "conf/dist/source/types"
import { CommandContext } from "../types/command"
import fetch, { RequestInfo, RequestInit, Response } from "node-fetch"
import { getToken } from "../lib/authentication/get-token"
import { getRegion, resolveHostFromRegion } from "./resolve-region"
import ws from "ws"
import { createConsoleLogger, ProcessOutput } from "@angular-devkit/core/node"
import * as ansiColors from "ansi-colors"
import { makeErrorWrapper } from "./error-handler"
import { renderError } from "../commands/ui"
import { Region } from "../lib/stores/region-schema"

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
        return Promise.resolve()
      },
      async (result) => {
        if (!result.success && verbose) {
          if (result.error instanceof Error) {
            console.error(`Error Code: ${result.error.name}`)
            console.error(`Error Message: ${result.error.message}`)
            console.error(`Error Stack: ${result.error.stack}`)
            console.error(`Error Cause: ${result.error.cause}`)
          } else if (isRecordStringAny(result.error)) {
            const errorObject = result.error
            const errors = Object.keys(errorObject).map((key) => {
              return { key, value: errorObject[key] }
            })

            renderError({
              body: `${errors
                .map((error) => `${error.key}: ${error.value}`)
                .join("\n")}`,
            })
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

export function createFixedRequester(region: Region, accessToken: string) {
  return async function regionScopedRequester(
    url: RequestInfo,
    init?: RequestInit,
  ) {
    const apiUrl = resolveHostFromRegion(region)
    const completeUrl = new URL(url.toString(), apiUrl)
    const authHeader = `Bearer ${accessToken}`

    return fetch(completeUrl, {
      ...(init || {}),
      headers: {
        ...(init?.headers || {}),
        Authorization: authHeader,
      },
    })
  } as typeof fetch
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
    const completeUrl = new URL(url.toString(), apiUrl)

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

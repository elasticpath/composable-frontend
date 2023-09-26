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
  }
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

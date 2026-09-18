import {
  createAnAccessToken,
  createClient,
  createConfig,
} from "@epcc-sdk/authentication"
import type { AccessTokenRequest } from "@epcc-sdk/authentication"
import { TokenRequestError } from "./errors"
import type { TokenRequestFailure } from "./errors"
import type { TokenProvider, TokenResponse } from "./types"

const TOKEN_PATH = "/oauth/access_token"

export interface GrantOptions {
  /** API base URL, e.g. https://euwest.api.elasticpath.com */
  baseUrl: string
  fetch?: typeof fetch
  headers?: Record<string, string>
  mapError?: (failure: TokenRequestFailure) => unknown
}

function raise(opts: GrantOptions, failure: TokenRequestFailure): never {
  const mapped = opts.mapError?.(failure)
  if (mapped !== undefined && mapped !== null) {
    throw mapped
  }
  const { message, ...init } = failure
  throw new TokenRequestError(message, init)
}

/**
 * The generated operation owns the request. `AccessTokenRequest` is serialized
 * with `Object.entries`, so a caller's key order is the field order on the wire.
 * Callers keep `client_id`, `client_secret`, `grant_type` so bodies stay
 * byte-identical to the hand-rolled clients.
 */
async function postTokenRequest(
  opts: GrantOptions,
  params: AccessTokenRequest,
): Promise<TokenResponse> {
  const baseUrl = opts.baseUrl.replace(/\/+$/, "")
  const url = `${baseUrl}${TOKEN_PATH}`

  // Never the package's shared `client`: it carries a hardcoded base URL.
  const client = createClient(createConfig({ baseUrl, fetch: opts.fetch }))

  // The client consumes the response stream, so keep the bytes for the failure
  // detail and for the parse below.
  let body = ""
  client.interceptors.response.use(async (response: Response) => {
    body = await response.clone().text()
    return response
  })

  const result = await createAnAccessToken({
    client,
    body: params,
    headers: { Accept: "application/json", ...opts.headers },
    parseAs: "text",
  })

  const response = result.response
  if (!response) {
    const cause = result.error
    raise(opts, {
      reason: "network",
      status: 0,
      body: "",
      url,
      message:
        cause instanceof Error ? cause.message : "Token request failed to send",
      cause,
    })
  }

  if (!response.ok) {
    raise(opts, {
      reason: "http",
      status: response.status,
      body,
      url,
      message: `Token request failed with status ${response.status}`,
    })
  }

  let parsed: TokenResponse
  try {
    parsed = JSON.parse(body) as TokenResponse
  } catch {
    raise(opts, {
      reason: "parse",
      status: response.status,
      body,
      url,
      message: "Token endpoint returned a non-JSON body",
    })
  }

  if (!parsed || typeof parsed.access_token !== "string") {
    raise(opts, {
      reason: "missing_token",
      status: response.status,
      body,
      url,
      message: "Token endpoint returned no access_token",
    })
  }

  return parsed
}

export interface ClientCredentialsOptions extends GrantOptions {
  clientId: string
  clientSecret: string
}

/** Carries a secret: server-side only, never a browser. */
export function clientCredentialsProvider(
  opts: ClientCredentialsOptions,
): TokenProvider {
  return () =>
    postTokenRequest(opts, {
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      grant_type: "client_credentials",
    })
}

export interface ImplicitOptions extends GrantOptions {
  clientId: string
}

export function implicitProvider(opts: ImplicitOptions): TokenProvider {
  return () =>
    postTokenRequest(opts, {
      client_id: opts.clientId,
      grant_type: "implicit",
    })
}

export function staticTokenProvider(token: string): TokenProvider {
  return async () => ({ access_token: token })
}

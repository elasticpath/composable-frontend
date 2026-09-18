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
 * `URLSearchParams` preserves insertion order, so a caller's `params` order is
 * the field order on the wire. Callers keep `client_id`, `client_secret`,
 * `grant_type` so bodies stay byte-identical to the hand-rolled clients.
 */
async function postTokenRequest(
  opts: GrantOptions,
  params: Record<string, string>,
): Promise<TokenResponse> {
  const url = `${opts.baseUrl.replace(/\/+$/, "")}${TOKEN_PATH}`
  const doFetch = opts.fetch ?? globalThis.fetch

  let response: Response
  let body: string
  try {
    response = await doFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        ...opts.headers,
      },
      body: new URLSearchParams(params).toString(),
    })
    body = await response.text()
  } catch (cause) {
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

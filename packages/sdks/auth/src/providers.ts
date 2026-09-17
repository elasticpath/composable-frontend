import { TokenRequestError } from "./errors"
import type { TokenRequestFailure } from "./errors"
import type { TokenProvider, TokenResponse } from "./types"

/** Path appended to `baseUrl` to reach the Elastic Path token endpoint. */
const TOKEN_PATH = "/oauth/access_token"

export interface GrantOptions {
  /** API base URL, e.g. https://euwest.api.elasticpath.com */
  baseUrl: string
  /** Replacement for the global fetch, for tests or a proxy. */
  fetch?: typeof fetch
  /** Extra headers on the token request, e.g. a User-Agent. */
  headers?: Record<string, string>
  /**
   * Translate a token-request failure into an error of your own vocabulary.
   * Called for every failure, with `reason` saying which kind it was; whatever
   * it returns is thrown in place of `TokenRequestError`. Return nothing to
   * keep the `TokenRequestError` for that case, and throw from inside the hook
   * if you would rather build the error that way.
   */
  mapError?: (failure: TokenRequestFailure) => unknown
}

/** Throw the caller's error for this failure, or ours if it did not supply one. */
function raise(opts: GrantOptions, failure: TokenRequestFailure): never {
  const mapped = opts.mapError?.(failure)
  if (mapped !== undefined && mapped !== null) {
    throw mapped
  }
  const { message, ...init } = failure
  throw new TokenRequestError(message, init)
}

/**
 * The one place that talks to the token endpoint. Every grant is the same POST
 * with a different set of form fields, so a new grant is a new caller here and
 * not a new transport. Uses plain fetch: this package has no runtime
 * dependencies and must work against any generator version.
 *
 * Field order follows the convention every hand-rolled Elastic Path client
 * uses — `client_id`, `client_secret`, `grant_type` — so a consumer migrating
 * onto this package sends byte-identical bodies. `URLSearchParams` preserves
 * insertion order, so the order of `params` is the order on the wire.
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
    // No response at all: DNS, TLS, a dropped connection, an abort. Wrapped so
    // a caller has one error type to catch and one hook to translate with;
    // `cause` still carries what fetch threw.
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

/**
 * Client credentials grant. The server-side grant: it carries a secret, so it
 * must never run in a browser.
 */
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

/** Implicit grant. The browser grant: no secret, shopper-scoped token. */
export function implicitProvider(opts: ImplicitOptions): TokenProvider {
  return () =>
    postTokenRequest(opts, {
      client_id: opts.clientId,
      grant_type: "implicit",
    })
}

/**
 * A token you already hold. Never calls a token endpoint, so it cannot be
 * refreshed: a 401 against a static token stays a 401.
 *
 * This is also the shape a JWT / token-exchange grant will take when it lands —
 * a `TokenProvider` is a plain function, so adding one is additive.
 */
export function staticTokenProvider(token: string): TokenProvider {
  return async () => ({ access_token: token })
}

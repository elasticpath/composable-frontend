import { TokenRequestError } from "./errors"
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
}

/**
 * The one place that talks to the token endpoint. Every grant is the same POST
 * with a different set of form fields, so a new grant is a new caller here and
 * not a new transport. Uses plain fetch: this package has no runtime
 * dependencies and must work against any generator version.
 */
async function postTokenRequest(
  opts: GrantOptions,
  params: Record<string, string>,
): Promise<TokenResponse> {
  const url = `${opts.baseUrl.replace(/\/+$/, "")}${TOKEN_PATH}`
  const doFetch = opts.fetch ?? globalThis.fetch

  const response = await doFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      ...opts.headers,
    },
    body: new URLSearchParams(params).toString(),
  })

  const body = await response.text()

  if (!response.ok) {
    throw new TokenRequestError(
      `Token request failed with status ${response.status}`,
      { status: response.status, body, url },
    )
  }

  let parsed: TokenResponse
  try {
    parsed = JSON.parse(body) as TokenResponse
  } catch {
    throw new TokenRequestError("Token endpoint returned a non-JSON body", {
      status: response.status,
      body,
      url,
    })
  }

  if (!parsed || typeof parsed.access_token !== "string") {
    throw new TokenRequestError("Token endpoint returned no access_token", {
      status: response.status,
      body,
      url,
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
      grant_type: "client_credentials",
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
    })
}

export interface ImplicitOptions extends GrantOptions {
  clientId: string
}

/** Implicit grant. The browser grant: no secret, shopper-scoped token. */
export function implicitProvider(opts: ImplicitOptions): TokenProvider {
  return () =>
    postTokenRequest(opts, {
      grant_type: "implicit",
      client_id: opts.clientId,
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

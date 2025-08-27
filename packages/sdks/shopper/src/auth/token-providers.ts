import type { TokenProvider } from "./kit"
import { type Config, createClient } from "@hey-api/client-fetch"
import { createAnAccessToken } from "../client/sdk.gen"

/**
 * Fresh-instance implicit token provider.
 * Always constructs a new, BARE sdk client (no auth wrapper, no interceptors) and calls the OAuth op.
 * This is loop-proof because it never uses the authed client.
 */
export function makeImplicitTokenProviderWithFreshSdk(opts: {
  baseUrl: string
  clientId: string
  fetch?: Config["fetch"]
  headers?: HeadersInit | Record<string, string>
  // If your SDK needs any other createClient options, add them here and pass through.
}): TokenProvider {
  return async () => {
    const bare = createClient({
      baseUrl: opts.baseUrl,
      fetch: opts.fetch,
      headers: opts.headers,
    })

    const resp = await createAnAccessToken({
      client: bare,
      body: { grant_type: "implicit", client_id: opts.clientId },
    })

    if (resp.error) {
      throw new Error(
        "makeImplicitTokenProviderWithFreshSdk: Failed to get access token",
      )
    }

    const x = resp.data

    return {
      access_token: x.access_token,
      expires_in: x.expires_in ?? undefined,
      expires: x.expires ?? undefined,
      token_type: x.token_type ?? undefined,
    }
  }
}

/**
 * Cached bare instance (minor perf win, still loop-proof).
 * Reuses a single bare client for all OAuth calls.
 */
export function makeImplicitTokenProviderCachedBare(opts: {
  baseUrl: string
  clientId: string
  fetch?: Config["fetch"]
  headers?: HeadersInit | Record<string, string>
}): TokenProvider {
  let bare = createClient({
    baseUrl: opts.baseUrl,
    fetch: opts.fetch,
    headers: opts.headers,
  })

  return async () => {
    const resp = await createAnAccessToken({
      client: bare,
      body: { grant_type: "implicit", client_id: opts.clientId },
    })

    if (resp.error) {
      throw new Error(
        "makeImplicitTokenProviderCachedBare: Failed to get access token",
      )
    }

    const x = resp.data
    return {
      access_token: x.access_token,
      expires_in: x.expires_in,
      expires: x.expires,
      token_type: x.token_type,
    }
  }
}

import type { TokenProvider } from "./kit"
import { createClient } from "@hey-api/client-fetch"
import { createAnAccessToken } from "../client"

/**
 * Implicit token provider.
 * Always constructs a new, BARE sdk client (no auth wrapper, no interceptors) and calls the OAuth op.
 * This is loop-proof because it never uses the authed client.
 */
export function makeImplicitTokenProvider(opts: {
  baseUrl: string
  clientId: string
  fetch?: typeof fetch // user-supplied fetch (unwrapped)
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

    if (!resp) {
      throw new Error("Failed to obtain access token: no response")
    }
    return resp.data!
  }
}

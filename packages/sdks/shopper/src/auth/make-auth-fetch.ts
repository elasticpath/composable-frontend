import type { Auth } from "./kit"
import { Config } from "@hey-api/client-fetch"

/**
 * Wrap a base fetch (default: global fetch) with:
 *  - Authorization: Bearer <token> (unless caller already set it)
 *  - single forced re-auth + one retry on 401
 *  - optional skip for OAuth endpoints
 */
export function makeAuthFetch(
  auth: Auth,
  baseFetch?: Config["fetch"],
  opts?: { isAuthRequest?: (url: string, init: RequestInit) => boolean },
): Config["fetch"] {
  // Default to global fetch if not provided
  const fetchFn = baseFetch || ((request: Request) => globalThis.fetch(request))

  return async (request: Request) => {
    const url = request.url

    // Never intercept OAuth calls (avoid loops)
    if (opts?.isAuthRequest?.(url, {}) ?? url.includes("/oauth/")) {
      return fetchFn(request)
    }

    // Clone the request to modify headers
    const token = await auth.getValidAccessToken()
    const h1 = new Headers(request.headers)
    if (!h1.has("Authorization")) h1.set("Authorization", `Bearer ${token}`)

    const authedRequest = new Request(request, { headers: h1 })
    let res = await fetchFn(authedRequest)

    if (res.status !== 401) return res

    // Retry once after forced re-auth
    try {
      const fresh = await auth.refresh()
      const h2 = new Headers(request.headers)
      if (!h2.has("Authorization")) h2.set("Authorization", `Bearer ${fresh}`)

      const retryRequest = new Request(request, { headers: h2 })
      return fetchFn(retryRequest)
    } catch {
      auth.clear()
      return res // bubble the 401
    }
  }
}

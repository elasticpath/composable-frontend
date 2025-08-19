import type { Auth } from "./kit"

export function makeAuthFetch(
  auth: Auth,
  baseFetch: typeof fetch = fetch,
  opts?: { isAuthRequest?: (url: string, init: RequestInit) => boolean },
): typeof fetch {
  return async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url

    // never intercept OAuth calls
    if (opts?.isAuthRequest?.(url, init) ?? url.includes("/oauth/")) {
      return baseFetch(input, init)
    }

    const token = await auth.getValidAccessToken()
    const h1 = new Headers(init.headers)
    if (!h1.has("Authorization")) h1.set("Authorization", `Bearer ${token}`)
    let res = await baseFetch(input, { ...init, headers: h1 })

    if (res.status !== 401) return res

    try {
      const fresh = await auth.refresh()
      const h2 = new Headers(init.headers)
      if (!h2.has("Authorization")) h2.set("Authorization", `Bearer ${fresh}`)
      return await baseFetch(input, { ...init, headers: h2 })
    } catch {
      auth.clear()
      return res
    }
  }
}

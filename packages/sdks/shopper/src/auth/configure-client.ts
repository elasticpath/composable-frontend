import { client as singleton } from "../client/sdk.gen"
import { createClient as sdkCreateClient } from "@hey-api/client-fetch"
import { createAuth, type TokenProvider } from "./kit"
import {
  localStorageAdapter,
  cookieAdapter,
  type StorageAdapter,
} from "./storage"
import { makeAuthFetch } from "./make-auth-fetch"
import { makeImplicitTokenProviderWithFreshSdk } from "./token-providers"

// Exact types from the generated/heyapi surface
type HeyApiConfig = Parameters<typeof singleton.setConfig>[0]
type HeyApiCreateConfig = Parameters<typeof sdkCreateClient>[0]

export type AuthOptions = {
  /**
   * Elastic Path key (Client ID) for your store. Required.
   */
  clientId: string
  /**
   * Optional: supply your own provider. If omitted, we call the SDK’s OAuth op via a fresh bare client.
   */
  tokenProvider?: TokenProvider
  /**
   * Where to store the access token. Defaults to localStorage; use "cookie" for JS-readable cookies.
   */
  storage?: "localStorage" | "cookie" | StorageAdapter
  /**
   * Cookie options when storage = "cookie".
   */
  cookie?: Parameters<typeof cookieAdapter>[1]
  /**
   * Wrap the provided `fetch` with auth logic (attach Bearer + retry once on 401). Defaults to true.
   */
  wrapUserFetch?: boolean
}

/* ------------------------------------------------------------
   Helpers
------------------------------------------------------------ */

function resolveStorage(
  storage: AuthOptions["storage"],
  cookie?: AuthOptions["cookie"],
): StorageAdapter {
  return storage === "cookie"
    ? cookieAdapter("ep_shopper_access", { sameSite: "Lax", ...cookie })
    : storage === "localStorage" || !storage
    ? localStorageAdapter("ep.shopper.access")
    : storage
}

/**
 * Normalize either (req: Request) => Promise<Response>
 * or (input, init?) => Promise<Response> into standard fetch shape.
 */
function toStandardFetch(userFetch?: unknown): typeof fetch {
  if (!userFetch) {
    return (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init)
  }
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input, init)
    // Many heyapi configs accept (req: Request). Standard fetch also accepts a Request as the first arg.
    // Call with Request to satisfy both shapes.
    return (userFetch as (req: Request) => Promise<Response>)(req)
  }
}

function normalizeHeaders(
  headers: HeadersInit | Record<string, unknown> | undefined,
): HeadersInit | undefined {
  if (!headers) return undefined
  if (headers instanceof Headers || Array.isArray(headers)) return headers
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(headers)) out[k] = String(v)
  return out
}

function resolveFetch(
  auth: ReturnType<typeof createAuth>,
  userFetch: unknown,
  wrapUserFetch: boolean | undefined,
) {
  const baseStd: typeof fetch = toStandardFetch(userFetch) // unified shape
  const authedStd = makeAuthFetch(auth, baseStd, {
    isAuthRequest: (u) => u.includes("/oauth/"),
  })
  // If user opts out, still return a standard-shaped fetch
  return wrapUserFetch !== false ? authedStd : baseStd
}

/* ------------------------------------------------------------
   Public API
------------------------------------------------------------ */

/**
 * Configure the generated singleton client using the *exact* Hey API config,
 * plus separate Auth options.
 */
export function configureClient(config: HeyApiConfig, authOpts: AuthOptions) {
  const { fetch: userFetch, headers, ...rest } = config

  // Some codegens mark baseUrl optional in the type; we rely on what the caller passed.
  const baseUrl = (config as any).baseUrl as string

  const storageImpl = resolveStorage(authOpts.storage, authOpts.cookie)
  const headersNorm = normalizeHeaders(headers)

  const provider: TokenProvider =
    authOpts.tokenProvider ??
    makeImplicitTokenProviderWithFreshSdk({
      baseUrl: String(baseUrl),
      clientId: authOpts.clientId,
      fetch: userFetch as any, // unwrapped
      headers: headersNorm,
    })

  const auth = createAuth(storageImpl, provider)
  const finalFetch = resolveFetch(auth, userFetch, authOpts.wrapUserFetch)

  singleton.setConfig({
    ...rest,
    baseUrl,
    headers: headersNorm,
    fetch: finalFetch,
  })

  return { client: singleton, auth }
}

/**
 * Create and return a brand-new client instance (does not mutate the singleton),
 * using the *exact* Hey API createClient config + separate Auth options.
 */
export function createShopperClient<T extends NonNullable<HeyApiCreateConfig>>(
  config: T,
  authOpts: AuthOptions,
) {
  const { fetch: userFetch, headers, ...rest } = config
  const baseUrl = (config as any).baseUrl as string

  const storageImpl = resolveStorage(authOpts.storage, authOpts.cookie)
  const headersNorm = normalizeHeaders(headers)

  const provider: TokenProvider =
    authOpts.tokenProvider ??
    makeImplicitTokenProviderWithFreshSdk({
      baseUrl: String(baseUrl),
      clientId: authOpts.clientId,
      fetch: userFetch as any,
      headers: headersNorm,
    })

  const auth = createAuth(storageImpl, provider)
  const finalFetch = resolveFetch(auth, userFetch, authOpts.wrapUserFetch)

  const instance = sdkCreateClient({
    ...rest,
    baseUrl,
    headers: headersNorm,
    fetch: finalFetch,
  })

  return { client: instance, auth }
}

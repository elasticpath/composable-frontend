import { client as singleton } from "./client/sdk.gen"
import { Config, createClient as sdkCreateClient } from "@hey-api/client-fetch"
import { createAuth, type TokenProvider } from "./auth/kit"
import {
  localStorageAdapter,
  cookieAdapter,
  type StorageAdapter,
} from "./auth/storage"
import { makeAuthFetch } from "./auth/make-auth-fetch"
import { makeImplicitTokenProvider } from "./auth/token-providers"

type HeyApiConfig = Parameters<typeof singleton.setConfig>[0]
type HeyApiCreateConfig = Config

type CommonAuthOpts = {
  clientId: string
  tokenProvider?: TokenProvider // optional override
  storage?: "localStorage" | "cookie" | StorageAdapter
  cookie?: Parameters<typeof cookieAdapter>[1]
  wrapUserFetch?: boolean
}

export type ConfigureClientOptions = Omit<HeyApiConfig, "fetch"> &
  CommonAuthOpts
export type CreateShopperClientOptions = Omit<HeyApiCreateConfig, "fetch"> &
  CommonAuthOpts

function resolveStorage(
  storage: CommonAuthOpts["storage"],
  cookie?: CommonAuthOpts["cookie"],
): StorageAdapter {
  return storage === "cookie"
    ? cookieAdapter("ep_shopper_access", { sameSite: "Lax", ...cookie })
    : storage === "localStorage" || !storage
    ? localStorageAdapter("ep.shopper.access")
    : storage
}

function resolveFetch(
  auth: ReturnType<typeof createAuth>,
  userFetch: HeyApiConfig["fetch"] | HeyApiCreateConfig["fetch"] | undefined,
  wrapUserFetch: boolean | undefined,
) {
  const base =
    userFetch ?? ((i: RequestInfo | URL, init?: RequestInit) => fetch(i, init))
  return wrapUserFetch !== false
    ? makeAuthFetch(auth, base as any, {
        isAuthRequest: (u) => u.includes("/oauth/"),
      })
    : userFetch ??
        makeAuthFetch(auth, fetch, {
          isAuthRequest: (u) => u.includes("/oauth/"),
        })
}

/** Singleton configurator */
export function configureClient(opts: ConfigureClientOptions) {
  const {
    clientId,
    tokenProvider,
    storage,
    cookie,
    wrapUserFetch = true,
    fetch: userFetch,
    headers,
    baseUrl,
    ...rest
  } = opts as ConfigureClientOptions & HeyApiConfig

  const storageImpl = resolveStorage(storage, cookie)

  // **fresh bare client each time** for OAuth
  const provider: TokenProvider =
    tokenProvider ??
    makeImplicitTokenProvider({
      baseUrl: String(baseUrl),
      clientId,
      fetch: userFetch as any, // unwrapped
      headers: headers as any,
    })

  const auth = createAuth(storageImpl, provider)
  const finalFetch = resolveFetch(auth, userFetch, wrapUserFetch)

  singleton.setConfig({ ...rest, baseUrl, headers, fetch: finalFetch })
  return { client: singleton, auth }
}

/** Factory that returns a brand-new authed client instance */
export function createShopperClient(opts: CreateShopperClientOptions) {
  const {
    clientId,
    tokenProvider,
    storage,
    cookie,
    wrapUserFetch = true,
    fetch: userFetch,
    headers,
    baseUrl,
    ...rest
  } = opts as CreateShopperClientOptions & HeyApiCreateConfig

  const storageImpl = resolveStorage(storage, cookie)

  // fresh bare client provider (uses createClient internally every call)
  const provider: TokenProvider =
    tokenProvider ??
    makeImplicitTokenProvider({
      baseUrl: String(baseUrl),
      clientId,
      fetch: userFetch as any,
      headers: headers as any,
    })

  const auth = createAuth(storageImpl, provider)
  const finalFetch = resolveFetch(auth, userFetch, wrapUserFetch)

  const instance = sdkCreateClient({
    ...rest,
    baseUrl,
    headers,
    fetch: finalFetch,
  })
  return { client: instance, auth }
}

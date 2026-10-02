import {
  createAuthCallback,
  createAuthenticatedFetch,
  createRetryFetch,
  createTokenSource,
  implicitProvider,
  localStorageAdapter,
} from "@epcc-sdk/sdks-runtime"
import type {
  RetryFetchOptions,
  StorageAdapter,
  TokenProvider,
  TokenSource,
} from "@epcc-sdk/sdks-runtime"
import { createClient, createConfig } from "../client/client"
import type { Config } from "../client/client"
import { client as singleton } from "../client/client.gen"
import type { AccessTokenResponse } from "../client/types.gen"
import { CREDENTIALS_STORAGE_KEY } from "../constants/credentials"
import { cookieAdapter } from "./storage"

const generatedBaseUrl = singleton.getConfig().baseUrl!

export type ShopperTokenProvider = (ctx: {
  current?: string
}) => Promise<AccessTokenResponse>

export type AuthOptions = {
  /**
   * Elastic Path key (Client ID) for your store. Required.
   */
  clientId: string
  /**
   * Optional: supply your own provider. If omitted, the client requests an implicit token from `/oauth/access_token` at the configured base URL.
   */
  tokenProvider?: ShopperTokenProvider
  /**
   * Where to store the access token. Defaults to localStorage; use "cookie" for JS-readable cookies.
   */
  storage?: "localStorage" | "cookie" | StorageAdapter
  /**
   * Cookie options when storage = "cookie".
   */
  cookie?: Omit<NonNullable<Parameters<typeof cookieAdapter>[0]>, "name">
  /**
   * Wrap the provided `fetch` with auth logic (attach Bearer + retry once on 401) and backoff. Defaults to true.
   */
  wrapUserFetch?: boolean
  /**
   * Backoff on 408, 429 and, for methods safe to repeat, 5xx. `false` keeps authentication and drops the backoff.
   */
  retry?: Omit<RetryFetchOptions, "fetch"> | false
}

export type ShopperAuth = {
  getValidAccessToken(): Promise<string>
  refresh(): Promise<string>
  clear(): void
  getSnapshot(): string | undefined
}

function resolveStorage(
  storage: AuthOptions["storage"],
  cookie?: AuthOptions["cookie"],
): StorageAdapter {
  if (storage === "cookie") return cookieAdapter({ sameSite: "Lax", ...cookie })
  if (storage === "localStorage" || !storage) {
    return localStorageAdapter(CREDENTIALS_STORAGE_KEY)
  }
  return storage
}

function resolveProvider(
  authOpts: AuthOptions,
  baseUrl: string,
  userFetch: typeof fetch | undefined,
): TokenProvider {
  const { tokenProvider } = authOpts
  if (!tokenProvider) {
    return implicitProvider({
      baseUrl,
      clientId: authOpts.clientId,
      fetch: userFetch,
    })
  }
  return async (ctx) => {
    const response = await tokenProvider(ctx)
    if (!response.access_token) {
      throw new Error("tokenProvider returned no access_token")
    }
    return { ...response, access_token: response.access_token }
  }
}

function authAdapter(source: TokenSource): ShopperAuth {
  return {
    getValidAccessToken: () => source.getToken(),
    refresh: () => source.getToken({ forceRefresh: true }),
    clear: () => source.clear(),
    getSnapshot: () => source.peek(),
  }
}

function authenticate(
  config: Config,
  authOpts: AuthOptions,
  fallbackBaseUrl: string,
): { config: Config; auth: ShopperAuth } {
  const userFetch = config.fetch
  const baseUrl = config.baseUrl ?? fallbackBaseUrl

  const source = createTokenSource(
    resolveProvider(authOpts, baseUrl, userFetch),
    { storage: resolveStorage(authOpts.storage, authOpts.cookie) },
  )
  const auth = authAdapter(source)

  if (authOpts.wrapUserFetch === false) {
    return { config: { ...config, baseUrl }, auth }
  }

  const authFetch = createAuthenticatedFetch(source, { fetch: userFetch })
  const composedFetch =
    authOpts.retry === false
      ? authFetch
      : createRetryFetch({ ...authOpts.retry, fetch: authFetch })

  return {
    config: {
      ...config,
      baseUrl,
      auth: createAuthCallback(source),
      fetch: composedFetch,
    },
    auth,
  }
}

/**
 * Configure the generated shared client with the given client config plus auth options.
 */
export function configureClient(config: Config, authOpts: AuthOptions) {
  const authenticated = authenticate(
    config,
    authOpts,
    singleton.getConfig().baseUrl!,
  )
  singleton.setConfig(authenticated.config)
  return { client: singleton, auth: authenticated.auth }
}

/**
 * Create and return a new client instance (does not mutate the shared client) with the given client config plus auth options.
 */
export function createShopperClient(config: Config, authOpts: AuthOptions) {
  const authenticated = authenticate(config, authOpts, generatedBaseUrl)
  return {
    client: createClient(createConfig(authenticated.config)),
    auth: authenticated.auth,
  }
}

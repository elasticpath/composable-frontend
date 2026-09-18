import { createAuthCallback, createRetryFetch } from "./client-adapters"
import {
  clientCredentialsProvider,
  implicitProvider,
  staticTokenProvider,
} from "./providers"
import { createRetryingFetch } from "./retry"
import type { RetryingFetchOptions } from "./retry"
import { createTokenSource } from "./token-source"
import type { StorageAdapter, TokenProvider, TokenSource } from "./types"

/** The slice of a generated client's `Config` this factory writes to. */
export interface ConfigurableClientConfig {
  baseUrl?: string
  auth?: unknown
  fetch?: typeof fetch
}

/**
 * The two functions every generated `@epcc-sdk/*` package exports. Taking them
 * as an argument is what keeps this package free of any generated client and so
 * independent of the generator version each SDK was built with.
 */
export interface ClientFactories<TClient, TConfig extends ConfigurableClientConfig> {
  createClient: (config: TConfig) => TClient
  createConfig: (override?: TConfig) => TConfig
}

export interface ConfiguredClientOptions<TConfig extends ConfigurableClientConfig> {
  /** API base URL, e.g. https://euwest.api.elasticpath.com */
  baseUrl: string
  clientId?: string
  /** Carries a secret: server-side only, never a browser. */
  clientSecret?: string
  /** A token you minted yourself. Cannot be refreshed, so a 401 against it is final. */
  token?: string
  provider?: TokenProvider
  /** A source you already own, when you need `clear()` on sign-out. */
  source?: TokenSource
  storage?: StorageAdapter
  leewaySeconds?: number
  /** `false` keeps authentication and drops the backoff schedule. */
  retry?: Omit<RetryingFetchOptions, "fetch"> | false
  /** The transport underneath both wrappers: a proxy, an agent, a test spy. */
  fetch?: typeof fetch
  /** Merged last, so anything the factory chose can be overridden. */
  config?: Partial<TConfig>
}

function resolveProvider<TConfig extends ConfigurableClientConfig>(
  options: ConfiguredClientOptions<TConfig>,
): TokenProvider {
  if (options.provider) return options.provider
  if (options.token) return staticTokenProvider(options.token)

  // The token endpoint goes through the same transport, so a proxy or an agent
  // configured for the API also covers the grant.
  const { baseUrl, clientId, clientSecret, fetch: transport } = options
  if (clientId && clientSecret) {
    return clientCredentialsProvider({ baseUrl, clientId, clientSecret, fetch: transport })
  }
  if (clientId) {
    return implicitProvider({ baseUrl, clientId, fetch: transport })
  }

  throw new Error(
    "createConfiguredClient needs credentials: pass `source`, `provider`, `token`, " +
      "`clientId` and `clientSecret`, or `clientId` alone for the implicit grant.",
  )
}

/**
 * Builds a generated client with the token source, the composed `fetch` and the
 * `auth` hook already wired.
 *
 * The composition is the point and is not configurable: the auth wrapper goes
 * INSIDE the retry wrapper. Auth outside means a 401 at the end of a backoff
 * schedule replays the whole schedule rather than costing one extra request,
 * and a token that expires during a long wait is never refreshed.
 */
export function createConfiguredClient<TClient, TConfig extends ConfigurableClientConfig>(
  factories: ClientFactories<TClient, TConfig>,
  options: ConfiguredClientOptions<TConfig>,
): TClient {
  const source =
    options.source ??
    createTokenSource(resolveProvider(options), {
      storage: options.storage,
      leewaySeconds: options.leewaySeconds,
    })

  const authFetch = createRetryFetch(source, { fetch: options.fetch })
  const composedFetch =
    options.retry === false
      ? authFetch
      : createRetryingFetch({ ...options.retry, fetch: authFetch })

  const config = factories.createConfig({
    baseUrl: options.baseUrl,
    auth: createAuthCallback(source),
    fetch: composedFetch,
    ...options.config,
  } as TConfig)

  return factories.createClient(config)
}

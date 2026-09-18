import { createAuthCallback, createAuthenticatedFetch } from "./client-adapters"
import {
  clientCredentialsProvider,
  implicitProvider,
  staticTokenProvider,
} from "./providers"
import { createRetryFetch } from "./retry"
import type { RetryFetchOptions } from "./retry"
import { createTokenSource } from "./token-source"
import type { StorageAdapter, TokenProvider, TokenSource } from "./types"

export interface ConfigurableClientConfig {
  baseUrl?: string
  auth?: unknown
  fetch?: typeof fetch
}

export interface ClientFactories<TClient, TConfig extends ConfigurableClientConfig> {
  createClient: (config: TConfig) => TClient
  createConfig: (override?: TConfig) => TConfig
}

export interface ConfiguredClientOptions<TConfig extends ConfigurableClientConfig> {
  baseUrl: string
  clientId?: string
  /** Carries a secret: server-side only, never a browser. */
  clientSecret?: string
  /** A token you minted yourself. Cannot be refreshed, so a 401 against it is final. */
  token?: string
  provider?: TokenProvider
  source?: TokenSource
  storage?: StorageAdapter
  leewaySeconds?: number
  /** `false` keeps authentication and drops the backoff schedule. */
  retry?: Omit<RetryFetchOptions, "fetch"> | false
  fetch?: typeof fetch
  config?: Partial<TConfig>
  /** Receives the token source this call used, which `dispose()` needs. */
  onSource?: (source: TokenSource) => void
}

function resolveProvider<TConfig extends ConfigurableClientConfig>(
  options: ConfiguredClientOptions<TConfig>,
): TokenProvider {
  if (options.provider) return options.provider
  if (options.token) return staticTokenProvider(options.token)

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
 * The composition is not configurable: the auth wrapper goes INSIDE the retry
 * wrapper, because auth outside replays the whole backoff schedule for a 401
 * and never refreshes a token that expired during a wait.
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

  options.onSource?.(source)

  const authFetch = createAuthenticatedFetch(source, { fetch: options.fetch })
  const composedFetch =
    options.retry === false
      ? authFetch
      : createRetryFetch({ ...options.retry, fetch: authFetch })

  const config = factories.createConfig({
    baseUrl: options.baseUrl,
    auth: createAuthCallback(source),
    fetch: composedFetch,
    ...options.config,
  } as TConfig)

  return factories.createClient(config)
}

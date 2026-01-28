import type {
  BridgeConfig,
  BridgedClient,
  StorageAdapter,
  TokenData,
  TokenProvider,
  RetryConfig,
  ThrottleConfig,
} from "../types"
import {
  DEFAULT_RETRY_CONFIG,
  DEFAULT_THROTTLE_CONFIG,
  DEFAULT_LEGACY_STORAGE_KEY,
} from "../types"
import { SharedAuthState } from "../auth/shared-auth-state"
import { createLegacyStorageBridge } from "../auth/legacy-storage-bridge"
import { createFetchWithRetry } from "../fetch/fetch-with-retry"
import { createThrottledFetch } from "../fetch/throttle"

/**
 * Client interface that matches @hey-api/client-fetch client structure.
 * We use a minimal interface to avoid hard dependency on the package.
 */
interface HeyApiClient {
  setConfig(config: {
    baseUrl?: string
    headers?: HeadersInit | Record<string, string>
    fetch?: typeof fetch
  }): void
}

/**
 * Resolve storage option to a StorageAdapter.
 */
function resolveStorage(
  storage: BridgeConfig["storage"],
  legacyStorageKey?: string
): StorageAdapter {
  if (typeof storage === "object" && storage !== null) {
    // Already a StorageAdapter
    return storage
  }

  // Use legacy storage bridge with the specified backend
  return createLegacyStorageBridge({
    key: legacyStorageKey,
    backend: storage ?? "localStorage",
  })
}

/**
 * Create a default token provider that fetches implicit grant tokens.
 * This matches the old SDK's createAuthRequest function.
 */
function createDefaultTokenProvider(
  baseUrl: string,
  clientId: string,
  clientSecret?: string,
  baseFetch: typeof fetch = globalThis.fetch
): TokenProvider {
  return async (): Promise<TokenData> => {
    const grantType = clientSecret ? "client_credentials" : "implicit"

    const body = new URLSearchParams({
      grant_type: grantType,
      client_id: clientId,
    })

    if (clientSecret) {
      body.append("client_secret", clientSecret)
    }

    const response = await baseFetch(`${baseUrl}/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `Authentication failed: ${response.status} ${JSON.stringify(error)}`
      )
    }

    const tokenData: TokenData = await response.json()
    return tokenData
  }
}

/**
 * Compose the final fetch function with retry and throttle logic.
 */
function composeFetch(
  authState: SharedAuthState,
  retryConfig: Partial<RetryConfig>,
  throttleConfig: Partial<ThrottleConfig>,
  baseFetch: typeof fetch = globalThis.fetch
): typeof fetch {
  // Start with base fetch
  let composedFetch = baseFetch

  // Add throttling if enabled
  const fullThrottleConfig = { ...DEFAULT_THROTTLE_CONFIG, ...throttleConfig }
  if (fullThrottleConfig.enabled) {
    composedFetch = createThrottledFetch(composedFetch, fullThrottleConfig)
  }

  // Add retry logic (wraps the possibly-throttled fetch)
  const fullRetryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
  composedFetch = createFetchWithRetry(fullRetryConfig, authState, composedFetch)

  return composedFetch
}

/**
 * Create a bridged client that uses old SDK's auth, retry, and throttle logic.
 *
 * This function configures a @hey-api/client-fetch client to use:
 * - Shared auth state with the old SDK (via localStorage events)
 * - Retry logic matching the old SDK (exponential backoff, 401/429 handling)
 * - Optional throttling matching the old SDK
 *
 * @example
 * ```typescript
 * import { client } from '@epcc-sdk/sdks-shopper'
 * import { createBridgedClient } from '@epcc-sdk/compatibility-layer'
 *
 * const { client: shopperClient, auth } = createBridgedClient(client, {
 *   baseUrl: 'https://api.moltin.com',
 *   clientId: 'your-client-id',
 *   legacyStorageKey: 'epCredentials',  // Share with old SDK
 *   retry: { maxAttempts: 4 },
 *   throttle: { enabled: true },
 * })
 * ```
 */
export function createBridgedClient<T extends HeyApiClient>(
  client: T,
  config: BridgeConfig
): BridgedClient<T> {
  // Resolve storage
  const storage = resolveStorage(
    config.storage,
    config.legacyStorageKey ?? DEFAULT_LEGACY_STORAGE_KEY
  )

  // Create or use provided token provider
  const tokenProvider =
    config.tokenProvider ??
    createDefaultTokenProvider(
      config.baseUrl,
      config.clientId,
      config.clientSecret
    )

  // Create shared auth state
  const authState = new SharedAuthState({
    storage,
    tokenProvider,
    leewaySec: config.leewaySec,
  })

  // Compose fetch with retry and throttle
  const bridgedFetch = composeFetch(
    authState,
    config.retry ?? {},
    config.throttle ?? {}
  )

  // Configure the client
  client.setConfig({
    baseUrl: config.baseUrl,
    headers: config.headers,
    fetch: bridgedFetch,
  })

  return {
    client,
    auth: authState,
  }
}

/**
 * Create a bridged fetch function without configuring a specific client.
 * Use this if you need the fetch function directly.
 */
export function createBridgedFetch(config: BridgeConfig): {
  fetch: typeof fetch
  auth: SharedAuthState
} {
  const storage = resolveStorage(
    config.storage,
    config.legacyStorageKey ?? DEFAULT_LEGACY_STORAGE_KEY
  )

  const tokenProvider =
    config.tokenProvider ??
    createDefaultTokenProvider(
      config.baseUrl,
      config.clientId,
      config.clientSecret
    )

  const authState = new SharedAuthState({
    storage,
    tokenProvider,
    leewaySec: config.leewaySec,
  })

  const bridgedFetch = composeFetch(
    authState,
    config.retry ?? {},
    config.throttle ?? {}
  )

  return {
    fetch: bridgedFetch,
    auth: authState,
  }
}

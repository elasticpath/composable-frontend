/**
 * @epcc-sdk/compatibility-layer
 *
 * Compatibility layer enabling new TypeScript SDKs to use the old JS SDK's
 * battle-tested auth, retry, and throttle logic.
 *
 * Zero changes to old JS SDK required. This layer works by:
 * - Replicating retry and throttle logic
 * - Reading from the same storage keys the old SDK uses
 * - Using browser storage events to detect token updates
 * - Injecting custom fetch into new SDKs
 *
 * @example Basic Usage
 * ```typescript
 * import { client } from '@epcc-sdk/sdks-shopper'
 * import { createBridgedClient } from '@epcc-sdk/compatibility-layer'
 *
 * const { client: shopperClient, auth } = createBridgedClient(client, {
 *   baseUrl: 'https://api.elasticpath.com',
 *   clientId: 'your-client-id',
 *   legacyStorageKey: 'epCredentials',  // Share with old SDK
 * })
 * ```
 *
 * @example Multiple Clients (Commerce Manager pattern)
 * ```typescript
 * import { clientRegistry } from '@epcc-sdk/compatibility-layer'
 *
 * const admin = clientRegistry.getOrCreate({
 *   name: 'admin',
 *   authType: 'client_credentials',
 *   baseUrl: 'https://api.elasticpath.com',
 *   clientId: 'xxx',
 *   clientSecret: 'yyy',
 * })
 *
 * const shopper = clientRegistry.getOrCreate({
 *   name: 'shopper',
 *   authType: 'implicit',
 *   baseUrl: 'https://api.elasticpath.com',
 *   clientId: 'zzz',
 * })
 * ```
 */

// Types
export type {
  TokenData,
  StorageAdapter,
  TokenProvider,
  RetryConfig,
  ThrottleConfig,
  BridgeConfig,
  BridgedClient,
  SharedAuthStateInterface,
} from "./types"

export {
  DEFAULT_RETRY_CONFIG,
  DEFAULT_THROTTLE_CONFIG,
  DEFAULT_LEGACY_STORAGE_KEY,
} from "./types"

// Auth
export { SharedAuthState } from "./auth/shared-auth-state"
export type { SharedAuthStateOptions } from "./auth/shared-auth-state"

export {
  createLegacyStorageBridge,
  storageAdapters,
} from "./auth/legacy-storage-bridge"
export type { LegacyStorageBridgeOptions } from "./auth/legacy-storage-bridge"

// Fetch utilities
export {
  fetchWithRetry,
  createFetchWithRetry,
} from "./fetch/fetch-with-retry"

export {
  createThrottledFetch,
  createIsolatedThrottledFetch,
  resetGlobalThrottleQueue,
} from "./fetch/throttle"

// Client utilities
export {
  createBridgedClient,
  createBridgedFetch,
} from "./client/create-bridged-client"

export {
  ClientRegistry,
  clientRegistry,
} from "./client/client-registry"
export type {
  AuthType,
  ClientInstanceConfig,
  ClientInstance,
} from "./client/client-registry"

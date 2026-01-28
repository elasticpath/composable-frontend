/**
 * Token data structure compatible with both old and new SDK formats.
 * This matches the old SDK's credential storage format.
 */
export interface TokenData {
  /** The client ID used to obtain this token */
  client_id?: string
  /** The access token */
  access_token: string
  /** Unix timestamp when the token expires */
  expires?: number
  /** Token lifetime in seconds (from OAuth response) */
  expires_in?: number
  /** Grant type identifier (e.g., 'implicit', 'client_credentials') */
  identifier?: string
  /** Token type (usually 'Bearer') */
  token_type?: string
  /** Refresh token if available (for password/SSO flows) */
  refresh_token?: string
}

/**
 * Storage adapter interface compatible with new SDK's storage system.
 * Allows pluggable storage backends (localStorage, cookies, memory).
 */
export interface StorageAdapter {
  /** Return the current stored value or undefined if none. */
  get(): string | undefined
  /** Persist or remove the value. */
  set(value?: string): void
  /** Optional: subscribe to external changes (e.g., other tabs). Returns an unsubscribe function. */
  subscribe?(cb: () => void): () => void
}

/**
 * Function type for providing tokens.
 * Used by SharedAuthState to obtain new tokens when needed.
 */
export type TokenProvider = (opts: {
  /** Current token (if any) for refresh flows */
  current?: string
}) => Promise<TokenData>

/**
 * Configuration for retry behavior.
 * Matches the old SDK's retry configuration.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 4) */
  maxAttempts: number
  /** Base delay in milliseconds (default: 1000) */
  baseDelay: number
  /** Random jitter in milliseconds (default: 500) */
  jitter: number
  /** Whether to re-authenticate on 401 (default: true) */
  reauth: boolean
}

/**
 * Configuration for request throttling.
 * Matches the old SDK's throttle configuration.
 */
export interface ThrottleConfig {
  /** Whether throttling is enabled */
  enabled: boolean
  /** Number of requests allowed per interval (default: 3) */
  limit: number
  /** Interval in milliseconds (default: 125) */
  interval: number
}

/**
 * Configuration for creating a bridged client.
 */
export interface BridgeConfig {
  /** Base URL for API calls (e.g., 'https://api.moltin.com') */
  baseUrl: string
  /** Client ID for authentication */
  clientId: string
  /** Client secret for client_credentials flow (optional) */
  clientSecret?: string
  /** Storage adapter or shorthand name */
  storage?: StorageAdapter | "localStorage" | "cookie" | "memory"
  /** Legacy storage key to read from (default: 'epCredentials') */
  legacyStorageKey?: string
  /** Custom token provider function (for custom auth flows) */
  tokenProvider?: TokenProvider
  /** Retry configuration */
  retry?: Partial<RetryConfig>
  /** Throttle configuration */
  throttle?: Partial<ThrottleConfig>
  /** Default headers to include in all requests */
  headers?: Record<string, string>
  /** Leeway in seconds for token expiration check (default: 60) */
  leewaySec?: number
}

/**
 * Result of creating a bridged client.
 */
export interface BridgedClient<T> {
  /** The configured client */
  client: T
  /** Shared auth state for manual token management */
  auth: SharedAuthStateInterface
}

/**
 * Interface for SharedAuthState (for type references without circular deps).
 */
export interface SharedAuthStateInterface {
  /** Get a valid access token, refreshing if necessary */
  getValidAccessToken(): Promise<string>
  /** Force a token refresh */
  refresh(): Promise<string>
  /** Manually set token data (for external auth integration) */
  setToken(tokenData: TokenData): void
  /** Clear stored credentials */
  clear(): void
  /** Get current token without validation */
  getSnapshot(): string | undefined
  /** Check if current token is expired */
  isExpired(): boolean
  /** Subscribe to auth state changes */
  subscribe(callback: () => void): () => void
}

/**
 * Default configuration values matching old SDK.
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 4,
  baseDelay: 1000,
  jitter: 500,
  reauth: true,
}

export const DEFAULT_THROTTLE_CONFIG: ThrottleConfig = {
  enabled: false,
  limit: 3,
  interval: 125,
}

export const DEFAULT_LEGACY_STORAGE_KEY = "epCredentials"

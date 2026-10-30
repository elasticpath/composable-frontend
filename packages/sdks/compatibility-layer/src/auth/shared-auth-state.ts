import type {
  StorageAdapter,
  TokenData,
  TokenProvider,
  SharedAuthStateInterface,
} from "../types"

/**
 * JWT credentials store expires in milliseconds (exp * 1000), while OAuth
 * credentials store it in seconds. A seconds timestamp above this value
 * is after the year 5000, so a larger value must be milliseconds.
 */
const MAX_SECONDS_TIMESTAMP = 1e11

function toSeconds(expires: number): number {
  return expires > MAX_SECONDS_TIMESTAMP ? Math.floor(expires / 1000) : expires
}

export interface SharedAuthStateOptions {
  /** Storage adapter for persisting tokens */
  storage: StorageAdapter
  /** Function to obtain new tokens */
  tokenProvider: TokenProvider
  /** Leeway in seconds for expiration check (default: 60) */
  leewaySec?: number
}

/**
 * SharedAuthState manages authentication state across SDKs.
 *
 * Key features:
 * - Promise deduplication for concurrent refresh requests
 * - Cross-tab synchronization via storage events
 * - Compatible with old SDK's credential format
 *
 * Based on patterns from:
 * - New SDK: packages/sdks/shopper/src/auth/kit.ts
 * - Commerce Manager: authentication.service.ts (isRefreshing pattern)
 */
export class SharedAuthState implements SharedAuthStateInterface {
  private storage: StorageAdapter
  private tokenProvider: TokenProvider
  private credentials: TokenData | undefined
  /** Last raw value read from or written to storage, to detect outside writes */
  private lastStoredData: string | undefined
  private refreshPromise: Promise<string> | undefined
  private leewaySec: number
  private subscribers: Set<() => void> = new Set()
  private unsubscribeStorage?: () => void

  constructor(options: SharedAuthStateOptions) {
    this.storage = options.storage
    this.tokenProvider = options.tokenProvider
    this.leewaySec = options.leewaySec ?? 60

    // Load initial credentials from storage
    this.loadFromStorage()

    // Subscribe to external storage changes (e.g., other tabs, old SDK updates)
    if (this.storage.subscribe) {
      this.unsubscribeStorage = this.storage.subscribe(() => {
        this.loadFromStorage()
      })
    }
  }

  /**
   * Load credentials from storage.
   * Handles both new format (JSON object) and legacy format (plain token string).
   */
  private loadFromStorage(): void {
    const storedData = this.storage.get()
    this.lastStoredData = storedData
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        if (parsed.access_token) {
          this.credentials = parsed
        }
      } catch {
        // Not JSON, assume it's a legacy plain token
        this.credentials = { access_token: storedData }
      }
    } else {
      this.credentials = undefined
    }
    this.notifySubscribers()
  }

  /**
   * Write to storage and remember what storage now holds.
   */
  private writeStorage(value: string | undefined): void {
    this.storage.set(value)
    this.lastStoredData = this.storage.get()
  }

  /**
   * Notify all subscribers of auth state change.
   */
  private notifySubscribers(): void {
    this.subscribers.forEach((cb) => cb())
  }

  /**
   * Check if the current token is expired.
   */
  isExpired(): boolean {
    if (!this.credentials?.access_token) return true

    const { expires } = this.credentials

    // Without an expires field the expiry is unknown, so trust the token
    // and let a 401 trigger the refresh
    if (!expires) return false

    const now = Math.floor(Date.now() / 1000)
    return now >= toSeconds(expires) - this.leewaySec
  }

  /**
   * Get a valid access token, refreshing if necessary.
   */
  async getValidAccessToken(): Promise<string> {
    // Re-read storage: writes from the legacy SDK in this tab fire no storage event
    if (this.storage.get() !== this.lastStoredData) {
      this.loadFromStorage()
    }
    if (this.credentials?.access_token && !this.isExpired()) {
      return this.credentials.access_token
    }
    return this.refresh()
  }

  /**
   * Force a token refresh.
   * Deduplicates concurrent refresh calls (promise caching pattern).
   */
  async refresh(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        const tokenData = await this.tokenProvider({
          current: this.credentials?.access_token,
        })
        this.credentials = tokenData
        // Store in format compatible with old SDK
        this.writeStorage(JSON.stringify(tokenData))
        this.notifySubscribers()
        return tokenData.access_token
      } finally {
        this.refreshPromise = undefined
      }
    })()

    return this.refreshPromise
  }

  /**
   * Manually set token data.
   * Use this for external auth integration (e.g., password flow, SSO).
   */
  setToken(tokenData: TokenData): void {
    this.credentials = tokenData
    this.writeStorage(JSON.stringify(tokenData))
    this.notifySubscribers()
  }

  /**
   * Clear stored credentials.
   */
  clear(): void {
    this.credentials = undefined
    this.writeStorage(undefined)
    this.notifySubscribers()
  }

  /**
   * Get current token without validation.
   */
  getSnapshot(): string | undefined {
    return this.credentials?.access_token
  }

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Get the full credentials object.
   */
  getCredentials(): TokenData | undefined {
    return this.credentials
  }

  /**
   * Cleanup subscriptions.
   * Call this when disposing of the auth state.
   */
  dispose(): void {
    if (this.unsubscribeStorage) {
      this.unsubscribeStorage()
    }
    this.subscribers.clear()
  }
}

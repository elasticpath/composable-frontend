import type {
  StorageAdapter,
  TokenData,
  TokenProvider,
  SharedAuthStateInterface,
} from "../types"

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
 * - JWT expiration decoding
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
   * Notify all subscribers of auth state change.
   */
  private notifySubscribers(): void {
    this.subscribers.forEach((cb) => cb())
  }

  /**
   * Decode JWT expiration claim from access token.
   */
  private decodeJwtExp(jwt?: string): number | undefined {
    if (!jwt) return undefined
    try {
      const parts = jwt.split(".")
      if (parts.length !== 3) return undefined
      const payload = JSON.parse(atob(parts[1]))
      return typeof payload?.exp === "number" ? payload.exp : undefined
    } catch {
      return undefined
    }
  }

  /**
   * Check if the current token is expired.
   */
  isExpired(): boolean {
    if (!this.credentials?.access_token) return true

    const now = Math.floor(Date.now() / 1000)

    // Try to decode exp from JWT
    const jwtExp = this.decodeJwtExp(this.credentials.access_token)
    if (jwtExp) {
      return now >= jwtExp - this.leewaySec
    }

    // Use the expires field if available (absolute timestamp)
    if (this.credentials.expires) {
      return now >= this.credentials.expires - this.leewaySec
    }

    // If we can't determine expiration, consider it expired
    return true
  }

  /**
   * Get a valid access token, refreshing if necessary.
   */
  async getValidAccessToken(): Promise<string> {
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
        this.storage.set(JSON.stringify(tokenData))
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
    this.storage.set(JSON.stringify(tokenData))
    this.notifySubscribers()
  }

  /**
   * Clear stored credentials.
   */
  clear(): void {
    this.credentials = undefined
    this.storage.set(undefined)
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

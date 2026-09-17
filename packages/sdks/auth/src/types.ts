/** What a token endpoint hands back. Every field but `access_token` is optional. */
export interface TokenResponse {
  access_token: string
  /** Lifetime in seconds from now. What the client credentials grant returns. */
  expires_in?: number
  /** Absolute expiry as a Unix timestamp in seconds. */
  expires?: number
  token_type?: string
}

/**
 * How a token is obtained. `current` is the token being replaced, if any, so a
 * future refresh-token or exchange grant can use it.
 */
export type TokenProvider = (ctx: { current?: string }) => Promise<TokenResponse>

/** Where a token lives between calls. */
export interface StorageAdapter {
  /** The stored record, or undefined if there is none. */
  get(): string | undefined
  /** Persist a record, or remove it when called with no value. */
  set(value?: string): void
  /** Optional external-change notification (another tab). Returns an unsubscribe. */
  subscribe?(cb: () => void): () => void
}

/** A cache in front of a provider. */
export interface TokenSource {
  /** A valid token, acquiring or refreshing one if needed. */
  getToken(opts?: { forceRefresh?: boolean }): Promise<string>
  /** Drop the cached token. The next getToken() acquires a new one. */
  clear(): void
  /**
   * The cached token without acquiring one, or undefined when there is none.
   * Reports what is cached, so it can be stale; it does not check expiry.
   */
  peek(): string | undefined
}

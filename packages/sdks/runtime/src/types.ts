export interface TokenResponse {
  access_token: string
  expires_in?: number
  expires?: number
  token_type?: string
}

/** `current` is the token being replaced, for a future refresh or exchange grant. */
export type TokenProvider = (ctx: { current?: string }) => Promise<TokenResponse>

export interface StorageAdapter {
  get(): string | undefined
  /** Called with no value, removes the stored record. */
  set(value?: string): void
  subscribe?(cb: () => void): () => void
}

export interface TokenSource {
  getToken(opts?: { forceRefresh?: boolean }): Promise<string>
  clear(): void
  /**
   * True for any token this source issued recently, not only the one it holds
   * now. createAuthenticatedFetch's ownership check needs that: the source can
   * rotate between the `auth` hook stamping a header and the request being
   * sent, and a forced refresh in flight leaves nothing cached at all.
   */
  owns(token: string): boolean
  /** The cached token, expiry ignored. Reporting only: `owns` decides ownership. */
  peek(): string | undefined
  /** Releases the storage subscription. Idempotent, and safe to skip. */
  dispose(): void
}

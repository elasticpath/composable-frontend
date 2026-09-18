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
  /** True for any token this source issued recently, not only the one it holds now. */
  owns(token: string): boolean
  /** The cached token, expiry deliberately ignored: `owns` decides ownership. */
  peek(): string | undefined
  dispose(): void
}

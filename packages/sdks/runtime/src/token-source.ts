import { memoryStorage } from "./storage"
import type { StorageAdapter, TokenProvider, TokenResponse, TokenSource } from "./types"

const DEFAULT_LEEWAY_SECONDS = 60

interface Credential {
  access_token: string
  /** Absolute expiry, Unix seconds. */
  expiresAt?: number
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function base64Decode(input: string): string | undefined {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/")
  const full = padded + "=".repeat((4 - (padded.length % 4)) % 4)
  try {
    if (typeof atob === "function") return atob(full)
    const buffer = (globalThis as { Buffer?: { from(s: string, e: string): { toString(e: string): string } } })
      .Buffer
    return buffer?.from(full, "base64").toString("binary")
  } catch {
    return undefined
  }
}

export function jwtExpiry(token?: string): number | undefined {
  if (!token) return undefined
  const parts = token.split(".")
  if (parts.length !== 3) return undefined
  const payload = base64Decode(parts[1]!)
  if (!payload) return undefined
  try {
    const claims = JSON.parse(payload) as { exp?: unknown }
    return typeof claims.exp === "number" ? claims.exp : undefined
  } catch {
    return undefined
  }
}

export function expiryOf(response: TokenResponse): number | undefined {
  if (typeof response.expires_in === "number" && Number.isFinite(response.expires_in)) {
    return nowSeconds() + response.expires_in
  }
  if (typeof response.expires === "number" && Number.isFinite(response.expires)) {
    return response.expires
  }
  return jwtExpiry(response.access_token)
}

function serialize(credential: Credential): string {
  return JSON.stringify(credential)
}

function deserialize(raw?: string): Credential | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as Partial<Credential> & Partial<TokenResponse>
    if (parsed && typeof parsed.access_token === "string") {
      const expiresAt =
        typeof parsed.expiresAt === "number"
          ? parsed.expiresAt
          : typeof parsed.expires === "number"
            ? parsed.expires
            : jwtExpiry(parsed.access_token)
      return { access_token: parsed.access_token, expiresAt }
    }
    return undefined
  } catch {
    // Not JSON: an adapter holding a bare token string, ours or somebody else's.
    return { access_token: raw, expiresAt: jwtExpiry(raw) }
  }
}

export interface TokenSourceOptions {
  storage?: StorageAdapter
  leewaySeconds?: number
}

export function createTokenSource(
  provider: TokenProvider,
  options: TokenSourceOptions = {},
): TokenSource {
  const storage = options.storage ?? memoryStorage()
  const leeway = options.leewaySeconds ?? DEFAULT_LEEWAY_SECONDS

  let credential: Credential | undefined
  // The token a forced refresh threw away, kept only to hand the provider as
  // `current` for a future refresh or exchange grant.
  let superseded: string | undefined
  let inflight: Promise<string> | undefined
  // Bumped by anything that invalidates the cache. An acquisition started under
  // an older generation still resolves for its callers but no longer writes to
  // the cache, so a slow request cannot clobber a newer token.
  let generation = 0

  const loadFromStorage = () => {
    credential = deserialize(storage.get())
  }

  loadFromStorage()
  storage.subscribe?.(loadFromStorage)

  const isExpired = (candidate: Credential): boolean => {
    // No expiry information means "do not expire": a 401 is what discovers it.
    if (candidate.expiresAt === undefined) return false
    return nowSeconds() >= candidate.expiresAt - leeway
  }

  const acquire = (): Promise<string> => {
    if (inflight) return inflight

    const startedAt = generation
    const pending = (async () => {
      const response = await provider({
        current: credential?.access_token ?? superseded,
      })
      const next: Credential = {
        access_token: response.access_token,
        expiresAt: expiryOf(response),
      }
      if (startedAt === generation) {
        credential = next
        superseded = undefined
        storage.set(serialize(next))
      }
      return next.access_token
    })()

    inflight = pending
    const release = () => {
      if (inflight === pending) inflight = undefined
    }
    pending.then(release, release)

    return pending
  }

  return {
    getToken(opts = {}) {
      if (opts.forceRefresh) {
        generation += 1
        superseded = credential?.access_token ?? superseded
        credential = undefined
        inflight = undefined
      }

      const cached = credential
      if (cached && !isExpired(cached)) {
        return Promise.resolve(cached.access_token)
      }

      return acquire()
    },
    clear() {
      generation += 1
      credential = undefined
      superseded = undefined
      inflight = undefined
      storage.set(undefined)
    },
    peek() {
      return credential?.access_token
    },
  }
}

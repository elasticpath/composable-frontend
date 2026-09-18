import { memoryStorage } from "./storage"
import type { StorageAdapter, TokenProvider, TokenResponse, TokenSource } from "./types"

const DEFAULT_LEEWAY_SECONDS = 60

/**
 * How many issued tokens a source remembers for `owns`. A request in flight
 * carries the token that was current when its header was stamped, so ownership
 * has to outlive one rotation. Bounded so a long-lived source in a process that
 * refreshes on a schedule cannot grow without limit.
 */
const ISSUED_HISTORY_LIMIT = 8

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
  // The generation `inflight` started under, and whether a forced refresh is
  // what started it. Together they decide whether a forced caller joins the
  // request already running or supersedes it.
  let inflightGeneration = -1
  let inflightIsForced = false
  // Bumped by anything that invalidates the cache. An acquisition started under
  // an older generation still resolves for its callers but no longer writes to
  // the cache, so a slow request cannot clobber a newer token.
  let generation = 0
  // Oldest first. Every token this source handed out, including one an older
  // generation resolved with and never cached, because a request may be
  // carrying it right now.
  const issued: string[] = []

  const remember = (token: string) => {
    const at = issued.indexOf(token)
    if (at !== -1) issued.splice(at, 1)
    issued.push(token)
    while (issued.length > ISSUED_HISTORY_LIMIT) issued.shift()
  }

  const loadFromStorage = () => {
    credential = deserialize(storage.get())
    if (credential) remember(credential.access_token)
  }

  loadFromStorage()
  let unsubscribe = storage.subscribe?.(loadFromStorage)

  const isExpired = (candidate: Credential): boolean => {
    // No expiry information means "do not expire": a 401 is what discovers it.
    if (candidate.expiresAt === undefined) return false
    return nowSeconds() >= candidate.expiresAt - leeway
  }

  const acquire = (forced: boolean): Promise<string> => {
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
      // Remembered whatever the generation says, because this token is about to
      // be returned to a caller who will put it on a request.
      remember(next.access_token)
      if (startedAt === generation) {
        credential = next
        superseded = undefined
        storage.set(serialize(next))
      }
      return next.access_token
    })()

    inflight = pending
    inflightGeneration = startedAt
    inflightIsForced = forced
    const release = () => {
      if (inflight === pending) {
        inflight = undefined
        inflightIsForced = false
      }
    }
    pending.then(release, release)

    return pending
  }

  return {
    getToken(opts = {}) {
      if (opts.forceRefresh) {
        // One refresh per generation. Concurrent 401s all ask at once, and each
        // of them starting its own request stampedes the token endpoint and
        // hands most callers a token the cache never received.
        if (inflight && inflightIsForced && inflightGeneration === generation) {
          return inflight
        }

        generation += 1
        superseded = credential?.access_token ?? superseded
        credential = undefined
        inflight = undefined
        inflightIsForced = false

        return acquire(true)
      }

      const cached = credential
      if (cached && !isExpired(cached)) {
        return Promise.resolve(cached.access_token)
      }

      return acquire(false)
    },
    clear() {
      generation += 1
      credential = undefined
      superseded = undefined
      inflight = undefined
      inflightIsForced = false
      issued.length = 0
      storage.set(undefined)
    },
    owns(token) {
      return issued.includes(token)
    },
    peek() {
      return credential?.access_token
    },
    dispose() {
      unsubscribe?.()
      unsubscribe = undefined
    },
  }
}

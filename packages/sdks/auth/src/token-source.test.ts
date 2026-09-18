import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { memoryStorage } from "./storage"
import { createTokenSource, expiryOf, jwtExpiry } from "./token-source"
import type { TokenProvider } from "./types"

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function jwt(exp: number): string {
  return `${base64Url('{"alg":"none"}')}.${base64Url(JSON.stringify({ exp }))}.sig`
}

function countingProvider(extra: { expires_in?: number; expires?: number } = {}) {
  let issued = 0
  const seen: Array<string | undefined> = []
  const provider: TokenProvider = async (ctx) => {
    issued += 1
    seen.push(ctx.current)
    return { access_token: `token-${issued}`, ...extra }
  }
  return {
    provider,
    seen,
    get calls() {
      return issued
    },
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
})

afterEach(() => {
  vi.useRealTimers()
})

describe("expiry", () => {
  it("reads expires_in as a lifetime from now", () => {
    const now = Math.floor(Date.now() / 1000)
    expect(expiryOf({ access_token: "t", expires_in: 3600 })).toBe(now + 3600)
  })

  it("reads expires as an absolute timestamp", () => {
    expect(expiryOf({ access_token: "t", expires: 1893456000 })).toBe(1893456000)
  })

  it("prefers expires_in over expires", () => {
    const now = Math.floor(Date.now() / 1000)
    expect(expiryOf({ access_token: "t", expires_in: 60, expires: 1 })).toBe(now + 60)
  })

  it("falls back to a JWT exp claim", () => {
    const token = jwt(1893456000)
    expect(jwtExpiry(token)).toBe(1893456000)
    expect(expiryOf({ access_token: token })).toBe(1893456000)
  })

  it("returns undefined for an opaque token with no expiry fields", () => {
    expect(jwtExpiry("opaque")).toBeUndefined()
    expect(expiryOf({ access_token: "opaque" })).toBeUndefined()
  })

  it("expires a token once its lifetime minus the default 60s leeway has passed", async () => {
    const counter = countingProvider({ expires_in: 600 })
    const source = createTokenSource(counter.provider)

    expect(await source.getToken()).toBe("token-1")

    vi.advanceTimersByTime(539_000) // 61s of life left: still inside the leeway
    expect(await source.getToken()).toBe("token-1")

    vi.advanceTimersByTime(2_000) // 59s left: now stale
    expect(await source.getToken()).toBe("token-2")
  })

  it("honours a configured leeway, such as the 300s the MCP server uses", async () => {
    const counter = countingProvider({ expires_in: 600 })
    const source = createTokenSource(counter.provider, { leewaySeconds: 300 })

    expect(await source.getToken()).toBe("token-1")
    vi.advanceTimersByTime(299_000) // 301s left
    expect(await source.getToken()).toBe("token-1")
    vi.advanceTimersByTime(2_000) // 299s left
    expect(await source.getToken()).toBe("token-2")
  })

  it("expires on a JWT exp claim", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    let issued = 0
    const source = createTokenSource(async () => {
      issued += 1
      return { access_token: jwt(nowSeconds + issued * 120) }
    })

    const first = await source.getToken()
    vi.advanceTimersByTime(30_000) // 90s left, outside the 60s leeway
    expect(await source.getToken()).toBe(first)
    vi.advanceTimersByTime(31_000) // 59s left
    expect(await source.getToken()).not.toBe(first)
  })

  it("keeps a token with no expiry information until something invalidates it", async () => {
    const counter = countingProvider()
    const source = createTokenSource(counter.provider)

    expect(await source.getToken()).toBe("token-1")
    vi.advanceTimersByTime(30 * 24 * 60 * 60 * 1000)
    expect(await source.getToken()).toBe("token-1")
    expect(counter.calls).toBe(1)
  })
})

describe("caching", () => {
  it("acquires once and serves the cache afterwards", async () => {
    const counter = countingProvider({ expires_in: 3600 })
    const source = createTokenSource(counter.provider)

    expect(await source.getToken()).toBe("token-1")
    expect(await source.getToken()).toBe("token-1")
    expect(counter.calls).toBe(1)
  })

  it("collapses concurrent callers onto one token request", async () => {
    let resolve: ((value: { access_token: string }) => void) | undefined
    const provider = vi.fn(
      () =>
        new Promise<{ access_token: string }>((r) => {
          resolve = r
        }),
    )
    const source = createTokenSource(provider as unknown as TokenProvider)

    const all = Promise.all([source.getToken(), source.getToken(), source.getToken()])
    expect(provider).toHaveBeenCalledTimes(1)

    resolve!({ access_token: "shared" })
    expect(await all).toEqual(["shared", "shared", "shared"])
  })

  it("never shares a token between two sources", async () => {
    const counter = countingProvider()
    const a = createTokenSource(counter.provider)
    const b = createTokenSource(counter.provider)

    expect(await a.getToken()).toBe("token-1")
    expect(await b.getToken()).toBe("token-2")
    expect(counter.calls).toBe(2)
  })

  it("hands the provider the token it is replacing", async () => {
    const counter = countingProvider()
    const source = createTokenSource(counter.provider)

    await source.getToken()
    await source.getToken({ forceRefresh: true })

    expect(counter.seen).toEqual([undefined, "token-1"])
  })
})

describe("invalidation", () => {
  it("re-requests on a forced refresh", async () => {
    const counter = countingProvider()
    const source = createTokenSource(counter.provider)

    expect(await source.getToken()).toBe("token-1")
    expect(await source.getToken({ forceRefresh: true })).toBe("token-2")
    expect(await source.getToken()).toBe("token-2")
    expect(counter.calls).toBe(2)
  })

  it("does not let a forced refresh be answered by the request it superseded", async () => {
    const resolvers: Array<(value: { access_token: string }) => void> = []
    const source = createTokenSource(
      () => new Promise<{ access_token: string }>((r) => void resolvers.push(r)),
    )

    const first = source.getToken()
    const second = source.getToken({ forceRefresh: true })
    expect(resolvers).toHaveLength(2)

    resolvers[1]!({ access_token: "new" })
    resolvers[0]!({ access_token: "old" })

    expect(await first).toBe("old")
    expect(await second).toBe("new")
    expect(source.peek()).toBe("new")
  })

  it("drops the token on clear()", async () => {
    const counter = countingProvider()
    const storage = memoryStorage()
    const source = createTokenSource(counter.provider, { storage })

    await source.getToken()
    source.clear()

    expect(source.peek()).toBeUndefined()
    expect(storage.get()).toBeUndefined()
    expect(await source.getToken()).toBe("token-2")
  })
})

describe("failure", () => {
  it("rejects and caches nothing when acquisition fails", async () => {
    let attempts = 0
    const source = createTokenSource(async () => {
      attempts += 1
      if (attempts === 1) throw new Error("token endpoint down")
      return { access_token: "recovered" }
    })

    await expect(source.getToken()).rejects.toThrow("token endpoint down")
    expect(source.peek()).toBeUndefined()
    expect(await source.getToken()).toBe("recovered")
    expect(attempts).toBe(2)
  })
})

describe("peek", () => {
  it("is undefined before acquisition and the token after, without acquiring one", async () => {
    const counter = countingProvider({ expires_in: 120 })
    const source = createTokenSource(counter.provider)

    expect(source.peek()).toBeUndefined()
    expect(counter.calls).toBe(0)

    await source.getToken()
    expect(source.peek()).toBe("token-1")
    expect(counter.calls).toBe(1)
  })

  it("reports what is cached rather than checking expiry", async () => {
    const counter = countingProvider({ expires_in: 120 })
    const source = createTokenSource(counter.provider)

    await source.getToken()
    vi.advanceTimersByTime(61_000)

    expect(source.peek()).toBe("token-1")
    expect(await source.getToken()).toBe("token-2")
    expect(source.peek()).toBe("token-2")
  })
})

describe("storage", () => {
  it("writes the token so a second source in the same storage reuses it", async () => {
    const storage = memoryStorage()
    const counter = countingProvider({ expires_in: 3600 })

    const first = createTokenSource(counter.provider, { storage })
    expect(await first.getToken()).toBe("token-1")

    const second = createTokenSource(counter.provider, { storage })
    expect(await second.getToken()).toBe("token-1")
    expect(counter.calls).toBe(1)
  })

  it("adopts a token written from outside, as another tab would", async () => {
    const storage = memoryStorage()
    const counter = countingProvider()
    const source = createTokenSource(counter.provider, { storage })

    storage.set(JSON.stringify({ access_token: "from-another-tab" }))

    expect(source.peek()).toBe("from-another-tab")
    expect(await source.getToken()).toBe("from-another-tab")
    expect(counter.calls).toBe(0)
  })

  it("reads a bare token string left by an older client", async () => {
    const storage = memoryStorage("legacy-plain-token")
    const counter = countingProvider()
    const source = createTokenSource(counter.provider, { storage })

    expect(await source.getToken()).toBe("legacy-plain-token")
    expect(counter.calls).toBe(0)
  })
})

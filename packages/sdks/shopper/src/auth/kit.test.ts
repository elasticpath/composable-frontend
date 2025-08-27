import { describe, it, expect, vi, beforeEach } from "vitest"
import { createAuth, type TokenProvider } from "./kit"
import { memoryAdapter } from "./storage"
import { makeJwtExpIn } from "../test/utils"

beforeEach(() => {
  vi.resetAllMocks()
})

describe("createAuth", () => {
  it("returns existing valid token without calling provider", async () => {
    const t = makeJwtExpIn(3600)
    const storage = memoryAdapter(t)
    const provider: TokenProvider = vi.fn()
    const auth = createAuth(storage, provider)
    await expect(auth.getValidAccessToken()).resolves.toBe(t)
    expect(provider).not.toHaveBeenCalled()
  })

  it("calls provider when expired and stores token", async () => {
    const expired = makeJwtExpIn(-10)
    const storage = memoryAdapter(expired)
    const newTok = makeJwtExpIn(1200)
    const provider: TokenProvider = vi
      .fn()
      .mockResolvedValue({ access_token: newTok, expires_in: 1200 })
    const auth = createAuth(storage, provider)
    const got = await auth.getValidAccessToken()
    expect(got).toBe(newTok)
  })

  it("single-flight refresh across concurrent callers", async () => {
    const storage = memoryAdapter(makeJwtExpIn(-1))
    const provider = vi
      .fn()
      .mockResolvedValue({ access_token: makeJwtExpIn(1000) })
    const auth = createAuth(storage, provider)
    const [a, b, c] = await Promise.all([
      auth.getValidAccessToken(),
      auth.getValidAccessToken(),
      auth.getValidAccessToken(),
    ])
    expect(a).toBe(b)
    expect(b).toBe(c)
    expect(provider).toHaveBeenCalledTimes(1)
  })

  it("uses JWT exp over expires_in", async () => {
    const storage = memoryAdapter(makeJwtExpIn(-1))
    // JWT with long exp, but small expires_in -> should still accept by JWT exp
    const long = makeJwtExpIn(5000)
    const provider = vi
      .fn()
      .mockResolvedValue({ access_token: long, expires_in: 5 })
    const auth = createAuth(storage, provider)
    const got = await auth.getValidAccessToken()
    expect(got).toBe(long)
  })

  it("clear() drops token", async () => {
    const t = makeJwtExpIn(100)
    const storage = memoryAdapter(t)
    const provider = vi
      .fn()
      .mockResolvedValue({ access_token: makeJwtExpIn(100) })
    const auth = createAuth(storage, provider)
    expect(await auth.getValidAccessToken()).toBe(t)
    auth.clear()
    // next call needs provider
    await auth.getValidAccessToken()
    expect(provider).toHaveBeenCalledTimes(1)
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeAuthFetch } from "./make-auth-fetch"

beforeEach(() => {
  vi.resetAllMocks()
})

function ok(body = "ok", init: Partial<ResponseInit> = {}) {
  return new Response(body, { status: 200, ...init })
}
function unauthorized() {
  return new Response("nope", { status: 401 })
}

describe("makeAuthFetch", () => {
  const fakeAuth = (opts?: {
    token?: string
    refreshed?: string
    refreshFails?: boolean
  }) => {
    const api = {
      getValidAccessToken: vi.fn().mockResolvedValue(opts?.token ?? "t1"),
      refresh: opts?.refreshFails
        ? vi.fn().mockRejectedValue(new Error("fail"))
        : vi.fn().mockResolvedValue(opts?.refreshed ?? "t2"),
      clear: vi.fn(),
    }
    return api
  }

  it("attaches Authorization when missing", async () => {
    const base = vi.fn().mockResolvedValue(ok())
    const auth = fakeAuth({ token: "abc" })
    const f = makeAuthFetch(auth as any, base)
    await f(new Request("https://example.com/resource"))
    const req = base.mock.calls[0][0] as Request
    expect(req.headers.get("authorization")).toBe("Bearer abc")
  })

  it("does not overwrite pre-set Authorization", async () => {
    const base = vi.fn().mockResolvedValue(ok())
    const auth = fakeAuth({ token: "abc" })
    const f = makeAuthFetch(auth as any, base)
    await f(new Request("https://example.com/resource", { headers: { Authorization: "Bearer preset" } }))
    const req = base.mock.calls[0][0] as Request
    expect(req.headers.get("authorization")).toBe("Bearer preset")
  })

  it("retries once on 401 after refresh", async () => {
    const base = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(ok("retried"))
    const auth = fakeAuth({ token: "old", refreshed: "new" })
    const f = makeAuthFetch(auth as any, base)
    const res = await f(new Request("https://example.com/res"))
    expect(await res.text()).toBe("retried")
    expect(auth.refresh).toHaveBeenCalledTimes(1)
    const req1 = base.mock.calls[0][0] as Request
    const req2 = base.mock.calls[1][0] as Request
    expect(req1.headers.get("authorization")).toBe("Bearer old")
    expect(req2.headers.get("authorization")).toBe("Bearer new")
  })

  it("bubbles 401 when refresh fails", async () => {
    const base = vi.fn().mockResolvedValue(unauthorized())
    const auth = fakeAuth({ refreshFails: true })
    const f = makeAuthFetch(auth as any, base)
    const res = await f(new Request("https://example.com/res"))
    expect(res.status).toBe(401)
    expect(auth.clear).toHaveBeenCalledTimes(1)
  })

  it("skips oauth endpoints entirely", async () => {
    const base = vi.fn().mockResolvedValue(ok())
    const auth = fakeAuth({ token: "zzz" })
    const f = makeAuthFetch(auth as any, base, {
      isAuthRequest: (u) => u.includes("/oauth/"),
    })
    await f(new Request("https://example.com/oauth/access_token"))
    expect(auth.getValidAccessToken).not.toHaveBeenCalled()
    expect(base).toHaveBeenCalledTimes(1)
    const req = base.mock.calls[0][0] as Request
    expect(req.headers.get("authorization")).toBeNull()
  })
})

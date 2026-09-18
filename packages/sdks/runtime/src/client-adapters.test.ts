import { describe, expect, it, vi } from "vitest"
import { createAuthCallback, createAuthenticatedFetch } from "./client-adapters"
import { createTokenSource } from "./token-source"
import type { TokenSource } from "./types"

function rotatingSource() {
  let issued = 0
  return createTokenSource(async () => {
    issued += 1
    return { access_token: `token-${issued}` }
  })
}

interface Sent {
  url: string
  method: string
  authorization: string | null
  body: string
}

// Records from a clone, so recording never consumes the body under test.
function recordingFetch(statuses: number[]) {
  const sent: Sent[] = []
  let call = 0
  const fetchMock = vi.fn(async (request: Request) => {
    const copy = request.clone()
    sent.push({
      url: request.url,
      method: request.method,
      authorization: request.headers.get("Authorization"),
      body: await copy.text(),
    })
    const status = statuses[call] ?? statuses[statuses.length - 1] ?? 200
    call += 1
    return new Response(status === 204 ? null : `body-${call}`, { status })
  })
  return { fetchMock: fetchMock as unknown as typeof fetch, sent, raw: fetchMock }
}

describe("createAuthCallback", () => {
  it("returns the bare token, which is what Config.auth expects", async () => {
    const callback = createAuthCallback(rotatingSource())
    await expect(callback()).resolves.toBe("token-1")
  })

  it("asks the source on every request, so a rotated token is picked up", async () => {
    const source = rotatingSource()
    const callback = createAuthCallback(source)

    expect(await callback()).toBe("token-1")
    await source.getToken({ forceRefresh: true })
    expect(await callback()).toBe("token-2")
  })
})

describe("createAuthenticatedFetch", () => {
  it("attaches a bearer token", async () => {
    const { fetchMock, sent } = recordingFetch([200])
    const retryFetch = createAuthenticatedFetch(rotatingSource(), { fetch: fetchMock })

    const response = await retryFetch("https://api.example.com/v2/products")

    expect(response.status).toBe(200)
    expect(sent[0]!.authorization).toBe("Bearer token-1")
  })

  it("accepts a Request, which is how a generated client calls it", async () => {
    const { fetchMock, sent } = recordingFetch([200])
    const retryFetch = createAuthenticatedFetch(rotatingSource(), { fetch: fetchMock })

    await retryFetch(new Request("https://api.example.com/v2/products"))

    expect(sent[0]!.authorization).toBe("Bearer token-1")
  })

  it("leaves an Authorization header the caller already set, and asks for no token", async () => {
    const { fetchMock, sent } = recordingFetch([200])
    const source = { ...rotatingSource(), getToken: vi.fn() } as unknown as TokenSource
    const retryFetch = createAuthenticatedFetch(source, { fetch: fetchMock })

    await retryFetch("https://api.example.com/v2/products", {
      headers: { Authorization: "Bearer caller-supplied" },
    })

    expect(sent[0]!.authorization).toBe("Bearer caller-supplied")
    expect(source.getToken).not.toHaveBeenCalled()
  })

  it("does not retry a 401 against a credential it did not issue", async () => {
    const { fetchMock, sent, raw } = recordingFetch([401])
    const retryFetch = createAuthenticatedFetch(rotatingSource(), { fetch: fetchMock })

    const response = await retryFetch("https://api.example.com/v2/products", {
      headers: { Authorization: "Basic someone-elses" },
    })

    expect(response.status).toBe(401)
    expect(raw).toHaveBeenCalledTimes(1)
    expect(sent[0]!.authorization).toBe("Basic someone-elses")
  })

  it("retries a 401 on a header the client's auth hook filled from the same source", async () => {
    const { fetchMock, sent, raw } = recordingFetch([401, 200])
    const source = rotatingSource()
    const authHook = createAuthCallback(source)
    const retryFetch = createAuthenticatedFetch(source, { fetch: fetchMock })

    const token = await authHook()
    const response = await retryFetch("https://api.example.com/v2/products", {
      method: "POST",
      body: "payload",
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(response.status).toBe(200)
    expect(raw).toHaveBeenCalledTimes(2)
    expect(sent.map((s) => s.authorization)).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
    expect(sent[1]!.body).toBe("payload")
  })

  it("retries a 401 on a header stamped before the source rotated", async () => {
    const { fetchMock, sent, raw } = recordingFetch([401, 200])
    const source = rotatingSource()
    const stamped = await createAuthCallback(source)()

    // Something else rotated the token between the hook stamping the header and
    // the request reaching the wire. The header now holds the previous token.
    await source.getToken({ forceRefresh: true })
    expect(source.peek()).toBe("token-2")

    const authFetch = createAuthenticatedFetch(source, { fetch: fetchMock })
    const response = await authFetch("https://api.example.com/v2/products", {
      headers: { Authorization: `Bearer ${stamped}` },
    })

    expect(response.status).toBe(200)
    expect(raw).toHaveBeenCalledTimes(2)
    expect(sent.map((s) => s.authorization)).toEqual([
      "Bearer token-1",
      "Bearer token-3",
    ])
  })

  it("retries a 401 while a forced refresh is in flight and nothing is cached", async () => {
    const { fetchMock, sent, raw } = recordingFetch([401, 200])
    let calls = 0
    const source = createTokenSource(async () => {
      calls += 1
      const issued = calls
      await new Promise((resolve) => setTimeout(resolve, 50))
      return { access_token: `token-${issued}` }
    })

    expect(await source.getToken()).toBe("token-1")

    const refreshing = source.getToken({ forceRefresh: true })
    expect(source.peek()).toBeUndefined()

    const authFetch = createAuthenticatedFetch(source, { fetch: fetchMock })
    const response = await authFetch("https://api.example.com/v2/products", {
      headers: { Authorization: "Bearer token-1" },
    })

    expect(response.status).toBe(200)
    expect(await refreshing).toBe("token-2")
    expect(raw).toHaveBeenCalledTimes(2)
    expect(sent.map((s) => s.authorization)).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
    // The 401 joined the refresh already running rather than starting another.
    expect(calls).toBe(2)
  })

  it("never attaches a token to the OAuth endpoint", async () => {
    const { fetchMock, sent } = recordingFetch([200])
    const source = { ...rotatingSource(), getToken: vi.fn() } as unknown as TokenSource
    const retryFetch = createAuthenticatedFetch(source, { fetch: fetchMock })

    await retryFetch("https://api.example.com/oauth/access_token", { method: "POST" })

    expect(sent[0]!.authorization).toBeNull()
    expect(source.getToken).not.toHaveBeenCalled()
  })

  it("honours a custom isAuthRequest predicate", async () => {
    const { fetchMock, sent } = recordingFetch([200])
    const retryFetch = createAuthenticatedFetch(rotatingSource(), {
      fetch: fetchMock,
      isAuthRequest: (url) => url.includes("/token"),
    })

    await retryFetch("https://api.example.com/token")
    await retryFetch("https://api.example.com/oauth/access_token")

    expect(sent[0]!.authorization).toBeNull()
    expect(sent[1]!.authorization).toBe("Bearer token-1")
  })

  it("retries a 401 once with a fresh token", async () => {
    const { fetchMock, sent, raw } = recordingFetch([401, 200])
    const retryFetch = createAuthenticatedFetch(rotatingSource(), { fetch: fetchMock })

    const response = await retryFetch("https://api.example.com/v2/products")

    expect(response.status).toBe(200)
    expect(raw).toHaveBeenCalledTimes(2)
    expect(sent.map((s) => s.authorization)).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
  })

  it("retries a POST with the original body intact", async () => {
    const { fetchMock, sent, raw } = recordingFetch([401, 200])
    const retryFetch = createAuthenticatedFetch(rotatingSource(), { fetch: fetchMock })
    const payload = JSON.stringify({ data: { type: "product", name: "Chair" } })

    const response = await retryFetch("https://api.example.com/v2/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    })

    expect(response.status).toBe(200)
    expect(raw).toHaveBeenCalledTimes(2)
    expect(sent[0]!.body).toBe(payload)
    expect(sent[1]!.body).toBe(payload)
    expect(sent[1]!.method).toBe("POST")
    expect(sent[1]!.authorization).toBe("Bearer token-2")
  })

  it("pins the root cause: rebuilding from an already-used Request throws", () => {
    const original = new Request("https://api.example.com/v2/products", {
      method: "POST",
      body: "payload",
    })

    new Request(original, { headers: new Headers({ "X-First": "1" }) })
    expect(original.bodyUsed).toBe(true)
    expect(
      () => new Request(original, { headers: new Headers({ "X-Retry": "1" }) }),
    ).toThrow(TypeError)
  })

  it("returns a second 401 to the caller instead of throwing", async () => {
    const { fetchMock, raw } = recordingFetch([401, 401])
    const retryFetch = createAuthenticatedFetch(rotatingSource(), { fetch: fetchMock })

    const response = await retryFetch("https://api.example.com/v2/products", {
      method: "POST",
      body: "payload",
    })

    expect(response.status).toBe(401)
    expect(raw).toHaveBeenCalledTimes(2)
  })

  it("returns the original 401 and clears the source when the refresh itself fails", async () => {
    const { fetchMock, raw } = recordingFetch([401])
    let attempts = 0
    const source = createTokenSource(async () => {
      attempts += 1
      if (attempts > 1) throw new Error("token endpoint down")
      return { access_token: "token-1" }
    })
    const clear = vi.spyOn(source, "clear")
    const retryFetch = createAuthenticatedFetch(source, { fetch: fetchMock })

    const response = await retryFetch("https://api.example.com/v2/products")

    expect(response.status).toBe(401)
    expect(raw).toHaveBeenCalledTimes(1)
    expect(clear).toHaveBeenCalledTimes(1)
  })

  it("passes a non-401 error response through untouched", async () => {
    const { fetchMock, raw } = recordingFetch([422])
    const retryFetch = createAuthenticatedFetch(rotatingSource(), { fetch: fetchMock })

    const response = await retryFetch("https://api.example.com/v2/products")

    expect(response.status).toBe(422)
    expect(raw).toHaveBeenCalledTimes(1)
  })
})

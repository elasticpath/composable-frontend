import { describe, expect, it, vi } from "vitest"
import { createAuthenticatedFetch } from "./client-adapters"
import { createRetryFetch } from "./retry"
import { createTokenSource } from "./token-source"

// Both wrappers are `fetch`-shaped and take a `fetch`, so either nesting
// compiles. These tests are the record of which one is correct.

function countingSource() {
  const mints: string[] = []
  const source = createTokenSource(async () => {
    const token = `token-${mints.length + 1}`
    mints.push(token)
    return { access_token: token }
  })
  return { source, mints }
}

function originRejectingStaleTokens(healsOnToken: string) {
  const seen: Array<string | null> = []
  const fetchMock = vi.fn(async (request: Request) => {
    const authorization = request.headers.get("Authorization")
    seen.push(authorization)
    const status = authorization === `Bearer ${healsOnToken}` ? 200 : 401
    return new Response("payload", { status })
  })
  return { fetchMock: fetchMock as unknown as typeof fetch, seen }
}

function virtualTime() {
  const waits: number[] = []
  let clock = 0
  return {
    waits,
    now: () => clock,
    sleep: async (ms: number) => {
      waits.push(ms)
      clock += ms
    },
    rng: () => 0.5,
  }
}

describe("auth INSIDE retry — the shipped order", () => {
  it("recovers a 401 for the cost of one extra request, with no backoff wait", async () => {
    const { source, mints } = countingSource()
    const { fetchMock, seen } = originRejectingStaleTokens("token-2")
    const time = virtualTime()

    const composed = createRetryFetch({
      fetch: createAuthenticatedFetch(source, { fetch: fetchMock }),
      ...time,
    })

    const response = await composed("https://api.example.com/pcm/pricebooks")

    expect(response.status).toBe(200)
    expect(seen).toEqual(["Bearer token-1", "Bearer token-2"])
    expect(mints).toEqual(["token-1", "token-2"])
    expect(time.waits).toEqual([])
  })

  it("lets the auth layer refresh a token that expired during a backoff wait", async () => {
    const { source, mints } = countingSource()
    let call = 0
    const responses = [429, 429, 401, 200]
    const seen: Array<string | null> = []
    const fetchMock = vi.fn(async (request: Request) => {
      seen.push(request.headers.get("Authorization"))
      const status = responses[Math.min(call, responses.length - 1)]!
      call += 1
      return new Response("payload", { status })
    }) as unknown as typeof fetch
    const time = virtualTime()

    const composed = createRetryFetch({
      fetch: createAuthenticatedFetch(source, { fetch: fetchMock }),
      ...time,
    })

    const response = await composed("https://api.example.com/pcm/pricebooks")

    expect(response.status).toBe(200)
    expect(call).toBe(4)
    expect(mints).toEqual(["token-1", "token-2"])
    expect(seen[3]).toBe("Bearer token-2")
    expect(time.waits).toHaveLength(2)
  })

  it("does not multiply attempts: a 429 costs the retry budget and nothing else", async () => {
    const { source, mints } = countingSource()
    let call = 0
    const fetchMock = vi.fn(async () => {
      call += 1
      return new Response("payload", { status: call < 3 ? 429 : 200 })
    }) as unknown as typeof fetch
    const time = virtualTime()

    const composed = createRetryFetch({
      fetch: createAuthenticatedFetch(source, { fetch: fetchMock }),
      ...time,
    })

    await composed("https://api.example.com/pcm/pricebooks")

    expect(call).toBe(3)
    expect(mints).toEqual(["token-1"])
  })
})

describe("retry INSIDE auth — the order to avoid", () => {
  it("multiplies attempts when the credential stays dead: 3 x 2 against the same origin", async () => {
    // The origin never accepts anything, so neither order can recover and the
    // only difference left is the cost.
    const rightOrder = originRejectingStaleTokens("never-issued")
    const rightTime = virtualTime()
    const right = countingSource()
    const rightComposed = createRetryFetch({
      fetch: createAuthenticatedFetch(right.source, { fetch: rightOrder.fetchMock }),
      ...rightTime,
    })
    const rightResponse = await rightComposed("https://api.example.com/pcm/pricebooks")

    const wrongOrder = originRejectingStaleTokens("never-issued")
    const wrongTime = virtualTime()
    const wrong = countingSource()
    // Made worse on purpose by a policy that retries 401.
    const wrongComposed = createAuthenticatedFetch(wrong.source, {
      fetch: createRetryFetch({
        fetch: wrongOrder.fetchMock,
        shouldRetryStatus: ({ status }) => status === 401,
        ...wrongTime,
      }),
    })
    const wrongResponse = await wrongComposed("https://api.example.com/pcm/pricebooks")

    expect(rightResponse.status).toBe(401)
    expect(wrongResponse.status).toBe(401)

    // Auth inside: one send, one refresh, one replay.
    expect(rightOrder.seen).toHaveLength(2)
    expect(rightTime.waits).toEqual([])

    // Auth outside: the inner schedule replayed a dead token to exhaustion,
    // then the refresh ran the whole schedule again.
    expect(wrongOrder.seen).toHaveLength(6)
    expect(wrongTime.waits).toHaveLength(4)
    expect(wrongOrder.seen.slice(0, 3)).toEqual([
      "Bearer token-1",
      "Bearer token-1",
      "Bearer token-1",
    ])
    expect(wrong.mints).toEqual(["token-1", "token-2"])
  })

  it("freezes the token for the whole schedule even with a policy that skips 401", async () => {
    const { source, mints } = countingSource()
    let call = 0
    const responses = [429, 429, 401, 200]
    const seen: Array<string | null> = []
    const fetchMock = vi.fn(async (request: Request) => {
      seen.push(request.headers.get("Authorization"))
      const status = responses[Math.min(call, responses.length - 1)]!
      call += 1
      return new Response("payload", { status })
    }) as unknown as typeof fetch
    const time = virtualTime()

    const composed = createAuthenticatedFetch(source, {
      fetch: createRetryFetch({ fetch: fetchMock, ...time }),
    })

    const response = await composed("https://api.example.com/pcm/pricebooks")

    // Correct, but the two 429 waits were spent under a token the origin was
    // already about to reject.
    expect(response.status).toBe(200)
    expect(mints).toEqual(["token-1", "token-2"])
    expect(seen.slice(0, 3)).toEqual([
      "Bearer token-1",
      "Bearer token-1",
      "Bearer token-1",
    ])
  })
})

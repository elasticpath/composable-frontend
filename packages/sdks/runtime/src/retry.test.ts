import { describe, expect, it, vi } from "vitest"
import {
  computeDelay,
  createRetryingFetch,
  isNeverDelivered,
  parseRetryAfter,
  transportErrorCode,
} from "./retry"
import type { RetryEvent, RetryingFetchOptions } from "./retry"

interface Attempt {
  method: string
  url: string
  body: string
  contentType: string | null
}

type Script = Array<number | Error | { status: number; headers: Record<string, string> }>

// Records from a clone, so recording never consumes the body under test.
function scriptedFetch(script: Script) {
  const attempts: Attempt[] = []
  let call = 0
  const fetchMock = vi.fn(async (request: Request) => {
    const copy = request.clone()
    attempts.push({
      method: request.method,
      url: request.url,
      body: await copy.text(),
      contentType: request.headers.get("Content-Type"),
    })
    const step = script[Math.min(call, script.length - 1)]
    call += 1
    if (step instanceof Error) throw step
    if (typeof step === "number") return new Response("payload", { status: step })
    return new Response("payload", { status: step.status, headers: step.headers })
  })
  return { fetchMock: fetchMock as unknown as typeof fetch, attempts }
}

/** Virtual time: every wait is recorded rather than slept, so the suite stays fast. */
function harness(script: Script, options: RetryingFetchOptions = {}) {
  const { fetchMock, attempts } = scriptedFetch(script)
  const waits: number[] = []
  const events: RetryEvent[] = []
  let clock = 1_000
  const retrying = createRetryingFetch({
    fetch: fetchMock,
    now: () => clock,
    sleep: async (ms) => {
      waits.push(ms)
      clock += ms
    },
    rng: () => 0.5,
    onEvent: (event) => events.push(event),
    ...options,
  })
  return { retrying, attempts, waits, events, clock: () => clock }
}

function transportError(code: string): Error {
  const error = new TypeError("fetch failed")
  ;(error as { cause?: unknown }).cause = Object.assign(new Error(code), { code })
  return error
}

describe("parseRetryAfter", () => {
  it("reads the delay-seconds form", () => {
    expect(parseRetryAfter("120", 0)).toBe(120_000)
  })

  it("reads the HTTP-date form against the caller's clock", () => {
    const now = Date.parse("Fri, 31 Dec 1999 23:59:29 GMT")
    expect(parseRetryAfter("Fri, 31 Dec 1999 23:59:59 GMT", now)).toBe(30_000)
  })

  it("floors a date in the past at zero rather than waiting a negative time", () => {
    const now = Date.parse("Sat, 01 Jan 2000 00:00:29 GMT")
    expect(parseRetryAfter("Fri, 31 Dec 1999 23:59:59 GMT", now)).toBe(0)
  })

  it("returns null for absent and unparseable values so the curve takes over", () => {
    expect(parseRetryAfter(null, 0)).toBeNull()
    expect(parseRetryAfter("", 0)).toBeNull()
    expect(parseRetryAfter("soon", 0)).toBeNull()
    expect(parseRetryAfter("-5", 0)).toBeNull()
  })
})

describe("computeDelay", () => {
  it("doubles from the base and stops at the cap", () => {
    const at = (attempt: number) =>
      computeDelay({
        strategy: "exponential",
        jitter: "none",
        attempt,
        baseDelayMs: 500,
        maxDelayMs: 20_000,
        previousDelayMs: 0,
        rng: () => 0,
      })
    expect([1, 2, 3, 4, 5, 6, 7].map(at)).toEqual([
      500, 1000, 2000, 4000, 8000, 16_000, 20_000,
    ])
  })

  it("full jitter spans zero to the target", () => {
    const withRng = (value: number) =>
      computeDelay({
        strategy: "exponential",
        jitter: "full",
        attempt: 3,
        baseDelayMs: 500,
        maxDelayMs: 20_000,
        previousDelayMs: 0,
        rng: () => value,
      })
    expect(withRng(0)).toBe(0)
    expect(withRng(1)).toBe(2000)
  })

  it("equal jitter never drops below half the target", () => {
    expect(
      computeDelay({
        strategy: "exponential",
        jitter: "equal",
        attempt: 3,
        baseDelayMs: 500,
        maxDelayMs: 20_000,
        previousDelayMs: 0,
        rng: () => 0,
      }),
    ).toBe(1000)
  })
})

describe("transport error classification", () => {
  it("walks the cause chain Node's fetch hides the code behind", () => {
    expect(transportErrorCode(transportError("ECONNREFUSED"))).toBe("ECONNREFUSED")
    expect(transportErrorCode(new Error("nothing"))).toBeNull()
  })

  it("treats only the provably-undelivered codes as never delivered", () => {
    for (const code of [
      "ECONNREFUSED",
      "ENOTFOUND",
      "EAI_AGAIN",
      "ENETUNREACH",
      "EHOSTUNREACH",
    ]) {
      expect(isNeverDelivered(transportError(code))).toBe(true)
    }
    expect(isNeverDelivered(transportError("ECONNRESET"))).toBe(false)
  })
})

describe("createRetryingFetch status policy", () => {
  it("retries 429 on a POST, because the origin said it did not process it", async () => {
    const { retrying, attempts } = harness([429, 200])
    const response = await retrying("https://api.example.com/pcm/pricebooks", {
      method: "POST",
      body: '{"a":1}',
    })
    expect(response.status).toBe(200)
    expect(attempts).toHaveLength(2)
  })

  it("retries 408 on a POST for the same reason", async () => {
    const { retrying, attempts } = harness([408, 200])
    await retrying("https://api.example.com/pcm/pricebooks", { method: "POST" })
    expect(attempts).toHaveLength(2)
  })

  it("retries 503 on a GET", async () => {
    const { retrying, attempts } = harness([503, 503, 200])
    const response = await retrying("https://api.example.com/pcm/pricebooks")
    expect(response.status).toBe(200)
    expect(attempts).toHaveLength(3)
  })

  it("does NOT retry 503 on a POST: a replay can duplicate a pricebook", async () => {
    const { retrying, attempts } = harness([503, 201])
    const response = await retrying("https://api.example.com/pcm/pricebooks", {
      method: "POST",
      body: '{"a":1}',
    })
    expect(response.status).toBe(503)
    expect(attempts).toHaveLength(1)
  })

  it("retries 500, 502 and 504 on a PUT", async () => {
    for (const status of [500, 502, 504]) {
      const { retrying, attempts } = harness([status, 200])
      await retrying("https://api.example.com/pcm/pricebooks/1", { method: "PUT" })
      expect(attempts).toHaveLength(2)
    }
  })

  it("never retries 401: that failure belongs to the auth layer alone", async () => {
    const { retrying, attempts } = harness([401, 200])
    const response = await retrying("https://api.example.com/pcm/pricebooks")
    expect(response.status).toBe(401)
    expect(attempts).toHaveLength(1)
  })

  it("never retries other permanent answers", async () => {
    for (const status of [400, 403, 404, 409, 422, 501]) {
      const { retrying, attempts } = harness([status, 200])
      const response = await retrying("https://api.example.com/pcm/pricebooks")
      expect(response.status).toBe(status)
      expect(attempts).toHaveLength(1)
    }
  })

  it("returns the last response rather than throwing when attempts run out", async () => {
    const { retrying, attempts } = harness([429])
    const response = await retrying("https://api.example.com/pcm/pricebooks")
    expect(response.status).toBe(429)
    expect(attempts).toHaveLength(3)
  })
})

describe("createRetryingFetch transport policy", () => {
  it("retries a refused connection on a POST, which proves nothing was applied", async () => {
    const { retrying, attempts } = harness([transportError("ECONNREFUSED"), 201])
    const response = await retrying("https://api.example.com/pcm/pricebooks", {
      method: "POST",
    })
    expect(response.status).toBe(201)
    expect(attempts).toHaveLength(2)
  })

  it("retries an unresolved name on a POST", async () => {
    const { retrying, attempts } = harness([transportError("ENOTFOUND"), 201])
    await retrying("https://api.example.com/pcm/pricebooks", { method: "POST" })
    expect(attempts).toHaveLength(2)
  })

  it("retries an ambiguous reset on a GET", async () => {
    const { retrying, attempts } = harness([transportError("ECONNRESET"), 200])
    await retrying("https://api.example.com/pcm/pricebooks")
    expect(attempts).toHaveLength(2)
  })

  it("does NOT retry an ambiguous reset on a POST: the bytes may have landed", async () => {
    const { retrying, attempts } = harness([transportError("ECONNRESET"), 201])
    await expect(
      retrying("https://api.example.com/pcm/pricebooks", { method: "POST" }),
    ).rejects.toThrow("fetch failed")
    expect(attempts).toHaveLength(1)
  })

  it("throws the transport error rather than a response when attempts run out", async () => {
    const { retrying, attempts } = harness([transportError("ECONNREFUSED")])
    await expect(retrying("https://api.example.com/pcm/pricebooks")).rejects.toThrow(
      "fetch failed",
    )
    expect(attempts).toHaveLength(3)
  })
})

describe("createRetryingFetch waiting", () => {
  it("prefers Retry-After in seconds over the computed curve", async () => {
    const { retrying, waits } = harness([{ status: 429, headers: { "Retry-After": "2" } }, 200])
    await retrying("https://api.example.com/pcm/pricebooks")
    expect(waits).toEqual([2000])
  })

  it("prefers Retry-After in the HTTP-date form", async () => {
    const at = new Date(Date.now() + 3000).toUTCString()
    const { retrying, waits } = harness([{ status: 429, headers: { "Retry-After": at } }, 200], {
      now: () => Date.now(),
    })
    expect(waits).toEqual([])
    await retrying("https://api.example.com/pcm/pricebooks")
    expect(waits[0]).toBeGreaterThan(2000)
    expect(waits[0]).toBeLessThanOrEqual(3000)
  })

  it("falls back to the curve when Retry-After is unparseable", async () => {
    const { retrying, waits } = harness([
      { status: 429, headers: { "Retry-After": "soon" } },
      200,
    ])
    await retrying("https://api.example.com/pcm/pricebooks")
    expect(waits).toEqual([250])
  })

  it("uses the defaults the prototype settled: 3 attempts from a 500ms base", async () => {
    const { retrying, waits, attempts } = harness([429, 429, 200])
    await retrying("https://api.example.com/pcm/pricebooks")
    expect(attempts).toHaveLength(3)
    expect(waits).toEqual([250, 500])
  })

  it("gives up on the deadline rather than sleeping past it", async () => {
    const { retrying, waits, attempts, events } = harness(
      [{ status: 429, headers: { "Retry-After": "30" } }, 200],
      { deadlineMs: 5000 },
    )
    const response = await retrying("https://api.example.com/pcm/pricebooks")
    expect(response.status).toBe(429)
    expect(attempts).toHaveLength(1)
    expect(waits).toEqual([])
    expect(events.filter((e) => e.type === "give-up")).toEqual([
      { type: "give-up", reason: "deadline", attempt: 1, elapsedMs: 0 },
    ])
  })

  it("reports max-attempts and deadline as different give-up reasons", async () => {
    const { retrying, events } = harness([429])
    await retrying("https://api.example.com/pcm/pricebooks")
    expect(events.filter((e) => e.type === "give-up")).toEqual([
      { type: "give-up", reason: "max-attempts", attempt: 3, elapsedMs: 750 },
    ])
  })
})

describe("createRetryingFetch request replay", () => {
  it("replays a multipart body byte for byte under the same boundary", async () => {
    const form = new FormData()
    form.append("file", new Blob(["pricebook,rows\n1,2\n"]), "prices.csv")
    const { retrying, attempts } = harness([503, 503, 200])

    await retrying(new Request("https://api.example.com/pcm/pricebooks/import", {
      method: "PUT",
      body: form,
    }))

    expect(attempts).toHaveLength(3)
    const boundaries = attempts.map((a) => a.contentType)
    expect(new Set(boundaries).size).toBe(1)
    expect(new Set(attempts.map((a) => a.body)).size).toBe(1)
    expect(attempts[0]!.body).toContain(attempts[0]!.contentType!.split("boundary=")[1])
  })

  it("replays a JSON body unchanged", async () => {
    const { retrying, attempts } = harness([429, 200])
    await retrying("https://api.example.com/pcm/pricebooks", {
      method: "POST",
      body: '{"data":{"type":"pricebook"}}',
      headers: { "Content-Type": "application/json" },
    })
    expect(attempts.map((a) => a.body)).toEqual([
      '{"data":{"type":"pricebook"}}',
      '{"data":{"type":"pricebook"}}',
    ])
  })

  it("accepts a bare Request, which is how a generated client calls it", async () => {
    const { retrying, attempts } = harness([429, 200])
    await retrying(new Request("https://api.example.com/pcm/pricebooks"))
    expect(attempts[0]!.url).toBe("https://api.example.com/pcm/pricebooks")
  })
})

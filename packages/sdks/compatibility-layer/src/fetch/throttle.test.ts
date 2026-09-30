import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  createThrottledFetch,
  createIsolatedThrottledFetch,
  resetGlobalThrottleQueue,
} from "./throttle"

describe("createThrottledFetch", () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    resetGlobalThrottleQueue()
  })

  afterEach(() => {
    vi.clearAllMocks()
    resetGlobalThrottleQueue()
  })

  it("should return base fetch when throttling is disabled", async () => {
    const throttledFetch = createThrottledFetch(mockFetch, { enabled: false })

    await throttledFetch("https://api.test.com/products")

    expect(mockFetch).toHaveBeenCalledTimes(1)
    // When disabled, returns base fetch directly which is called with just the URL
    expect(mockFetch).toHaveBeenCalledWith("https://api.test.com/products")
  })

  it("should throttle requests when enabled", async () => {
    const throttledFetch = createThrottledFetch(mockFetch, {
      enabled: true,
      limit: 2,
      interval: 100,
    })

    // Make 4 requests
    const promises = [
      throttledFetch("https://api.test.com/1"),
      throttledFetch("https://api.test.com/2"),
      throttledFetch("https://api.test.com/3"),
      throttledFetch("https://api.test.com/4"),
    ]

    // Wait for all to complete
    await Promise.all(promises)

    expect(mockFetch).toHaveBeenCalledTimes(4)
  })

  it("should pass init options to fetch", async () => {
    const throttledFetch = createThrottledFetch(mockFetch, { enabled: true })

    const init = { method: "POST", body: JSON.stringify({ data: "test" }) }
    await throttledFetch("https://api.test.com/products", init)

    expect(mockFetch).toHaveBeenCalledWith("https://api.test.com/products", init)
  })
})

describe("createIsolatedThrottledFetch", () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should return base fetch when throttling is disabled", async () => {
    const throttledFetch = createIsolatedThrottledFetch(mockFetch, {
      enabled: false,
    })

    await throttledFetch("https://api.test.com/products")

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it("should use separate queue from global throttle", async () => {
    // Create two isolated throttled fetches
    const throttledFetch1 = createIsolatedThrottledFetch(mockFetch, {
      enabled: true,
      limit: 1,
      interval: 100,
    })

    const throttledFetch2 = createIsolatedThrottledFetch(mockFetch, {
      enabled: true,
      limit: 1,
      interval: 100,
    })

    // Both should be able to make requests independently
    const promises = [
      throttledFetch1("https://api.test.com/1"),
      throttledFetch2("https://api.test.com/2"),
    ]

    await Promise.all(promises)

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe("resetGlobalThrottleQueue", () => {
  it("should reset the global throttle queue", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))

    // Create throttled fetch with specific config
    const throttledFetch1 = createThrottledFetch(mockFetch, {
      enabled: true,
      limit: 5,
      interval: 1000,
    })

    await throttledFetch1("https://api.test.com/1")

    // Reset the queue
    resetGlobalThrottleQueue()

    // Create new throttled fetch - should create new queue
    const throttledFetch2 = createThrottledFetch(mockFetch, {
      enabled: true,
      limit: 1,
      interval: 100,
    })

    await throttledFetch2("https://api.test.com/2")

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

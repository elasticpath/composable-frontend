import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fetchWithRetry, createFetchWithRetry } from "./fetch-with-retry"
import type { SharedAuthStateInterface } from "../types"

describe("fetchWithRetry", () => {
  let mockFetch: ReturnType<typeof vi.fn>
  let mockAuthState: SharedAuthStateInterface

  beforeEach(() => {
    mockFetch = vi.fn()
    mockAuthState = {
      getValidAccessToken: vi.fn().mockResolvedValue("test-token"),
      refresh: vi.fn().mockResolvedValue("new-token"),
      setToken: vi.fn(),
      clear: vi.fn(),
      getSnapshot: vi.fn().mockReturnValue("test-token"),
      isExpired: vi.fn().mockReturnValue(false),
      subscribe: vi.fn().mockReturnValue(() => {}),
    }
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it("should return response on successful request", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
    })
    mockFetch.mockResolvedValueOnce(mockResponse)

    const request = new Request("https://api.test.com/products")
    const promise = fetchWithRetry(request, {}, mockAuthState, mockFetch)

    await vi.runAllTimersAsync()
    const response = await promise

    expect(response.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it("should add Authorization header from auth state", async () => {
    const mockResponse = new Response("{}", { status: 200 })
    mockFetch.mockResolvedValueOnce(mockResponse)

    const request = new Request("https://api.test.com/products")
    const promise = fetchWithRetry(request, {}, mockAuthState, mockFetch)

    await vi.runAllTimersAsync()
    await promise

    const calledRequest = mockFetch.mock.calls[0][0] as Request
    expect(calledRequest.headers.get("Authorization")).toBe("Bearer test-token")
  })

  it("should not add Authorization header for OAuth endpoints", async () => {
    const mockResponse = new Response("{}", { status: 200 })
    mockFetch.mockResolvedValueOnce(mockResponse)

    const request = new Request("https://api.test.com/oauth/access_token")
    const promise = fetchWithRetry(request, {}, mockAuthState, mockFetch)

    await vi.runAllTimersAsync()
    await promise

    const calledRequest = mockFetch.mock.calls[0][0] as Request
    expect(calledRequest.headers.get("Authorization")).toBeNull()
  })

  it("should retry on 401 with token refresh", async () => {
    const unauthorizedResponse = new Response("{}", { status: 401 })
    const successResponse = new Response("{}", { status: 200 })

    mockFetch
      .mockResolvedValueOnce(unauthorizedResponse)
      .mockResolvedValueOnce(successResponse)

    const request = new Request("https://api.test.com/products")
    const config = { maxAttempts: 4, baseDelay: 100, jitter: 0, reauth: true }

    const promise = fetchWithRetry(request, config, mockAuthState, mockFetch)

    // Let first request complete
    await vi.advanceTimersByTimeAsync(0)
    // Let refresh and retry timer complete
    await vi.advanceTimersByTimeAsync(200)

    const response = await promise

    expect(mockAuthState.refresh).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(response.status).toBe(200)
  })

  it("should retry on 429 with backoff", async () => {
    const rateLimitResponse = new Response("{}", { status: 429 })
    const successResponse = new Response("{}", { status: 200 })

    mockFetch
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(successResponse)

    const request = new Request("https://api.test.com/products")
    const config = { maxAttempts: 4, baseDelay: 100, jitter: 0, reauth: true }

    const promise = fetchWithRetry(request, config, mockAuthState, mockFetch)

    // Let first request complete
    await vi.advanceTimersByTimeAsync(0)
    // Let retry timer complete (attempt 1 * 100ms baseDelay)
    await vi.advanceTimersByTimeAsync(200)

    const response = await promise

    expect(mockAuthState.refresh).not.toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(response.status).toBe(200)
  })

  it("should stop retrying after max attempts", async () => {
    const rateLimitResponse = new Response("{}", { status: 429 })

    mockFetch.mockResolvedValue(rateLimitResponse)

    const request = new Request("https://api.test.com/products")
    const config = { maxAttempts: 3, baseDelay: 10, jitter: 0, reauth: true }

    const promise = fetchWithRetry(request, config, mockAuthState, mockFetch)

    // Run through all retry timers
    await vi.runAllTimersAsync()

    const response = await promise

    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(response.status).toBe(429)
  })

  it("should not retry on other error statuses", async () => {
    const errorResponse = new Response("{}", { status: 500 })
    mockFetch.mockResolvedValueOnce(errorResponse)

    const request = new Request("https://api.test.com/products")
    const promise = fetchWithRetry(request, {}, mockAuthState, mockFetch)

    await vi.runAllTimersAsync()
    const response = await promise

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(500)
  })

  it("should not retry 401 when reauth is disabled", async () => {
    const unauthorizedResponse = new Response("{}", { status: 401 })
    mockFetch.mockResolvedValueOnce(unauthorizedResponse)

    const request = new Request("https://api.test.com/products")
    const config = { reauth: false }

    const promise = fetchWithRetry(request, config, mockAuthState, mockFetch)

    await vi.runAllTimersAsync()
    const response = await promise

    expect(mockAuthState.refresh).not.toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(401)
  })

  it("should work without auth state", async () => {
    const mockResponse = new Response("{}", { status: 200 })
    mockFetch.mockResolvedValueOnce(mockResponse)

    const request = new Request("https://api.test.com/products")
    const promise = fetchWithRetry(request, {}, undefined, mockFetch)

    await vi.runAllTimersAsync()
    const response = await promise

    expect(response.status).toBe(200)
    const calledRequest = mockFetch.mock.calls[0][0] as Request
    expect(calledRequest.headers.get("Authorization")).toBeNull()
  })
})

describe("createFetchWithRetry", () => {
  it("should create a fetch function with retry logic", async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    const mockAuthState: SharedAuthStateInterface = {
      getValidAccessToken: vi.fn().mockResolvedValue("token"),
      refresh: vi.fn(),
      setToken: vi.fn(),
      clear: vi.fn(),
      getSnapshot: vi.fn(),
      isExpired: vi.fn(),
      subscribe: vi.fn().mockReturnValue(() => {}),
    }

    const retryFetch = createFetchWithRetry({}, mockAuthState, mockFetch)

    const response = await retryFetch("https://api.test.com/products")

    expect(response.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

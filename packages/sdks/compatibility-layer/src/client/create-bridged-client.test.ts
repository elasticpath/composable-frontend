import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createBridgedClient, createBridgedFetch } from "./create-bridged-client"
import type { StorageAdapter } from "../types"

describe("createBridgedClient", () => {
  let mockClient: { setConfig: ReturnType<typeof vi.fn> }
  let mockStorage: StorageAdapter

  beforeEach(() => {
    mockClient = {
      setConfig: vi.fn(),
    }

    mockStorage = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      subscribe: vi.fn().mockReturnValue(() => {}),
    }

    // Mock global fetch for token provider
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            access_token: "test-token",
            expires: Math.floor(Date.now() / 1000) + 3600,
          }),
          { status: 200 }
        )
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("should configure client with baseUrl and headers", () => {
    const { client } = createBridgedClient(mockClient, {
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      storage: mockStorage,
      headers: { "X-Custom-Header": "value" },
    })

    expect(client.setConfig).toHaveBeenCalledWith({
      baseUrl: "https://api.test.com",
      headers: { "X-Custom-Header": "value" },
      fetch: expect.any(Function),
    })
  })

  it("should return auth state", () => {
    const { auth } = createBridgedClient(mockClient, {
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      storage: mockStorage,
    })

    expect(auth).toBeDefined()
    expect(auth.getValidAccessToken).toBeDefined()
    expect(auth.refresh).toBeDefined()
    expect(auth.setToken).toBeDefined()
    expect(auth.clear).toBeDefined()
  })

  it("should use provided storage adapter", () => {
    createBridgedClient(mockClient, {
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      storage: mockStorage,
    })

    // Storage subscribe should be called during auth state initialization
    expect(mockStorage.subscribe).toHaveBeenCalled()
  })

  it("should use custom token provider when provided", async () => {
    const customTokenProvider = vi.fn().mockResolvedValue({
      access_token: "custom-token",
      expires: Math.floor(Date.now() / 1000) + 3600,
    })

    const { auth } = createBridgedClient(mockClient, {
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      storage: mockStorage,
      tokenProvider: customTokenProvider,
    })

    const token = await auth.refresh()

    expect(customTokenProvider).toHaveBeenCalled()
    expect(token).toBe("custom-token")
  })

  it("should use default token provider for implicit grant", async () => {
    const { auth } = createBridgedClient(mockClient, {
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      storage: mockStorage,
    })

    await auth.refresh()

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/oauth/access_token",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("grant_type=implicit"),
      })
    )
  })

  it("should use client_credentials grant when clientSecret is provided", async () => {
    const { auth } = createBridgedClient(mockClient, {
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      clientSecret: "test-secret",
      storage: mockStorage,
    })

    await auth.refresh()

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test.com/oauth/access_token",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("grant_type=client_credentials"),
      })
    )
  })

  it("should apply retry configuration", () => {
    createBridgedClient(mockClient, {
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      storage: mockStorage,
      retry: {
        maxAttempts: 5,
        baseDelay: 2000,
      },
    })

    // The retry config is applied internally to the fetch wrapper
    expect(mockClient.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        fetch: expect.any(Function),
      })
    )
  })

  it("should apply throttle configuration", () => {
    createBridgedClient(mockClient, {
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      storage: mockStorage,
      throttle: {
        enabled: true,
        limit: 5,
        interval: 200,
      },
    })

    expect(mockClient.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        fetch: expect.any(Function),
      })
    )
  })
})

describe("createBridgedFetch", () => {
  let mockStorage: StorageAdapter

  beforeEach(() => {
    mockStorage = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      subscribe: vi.fn().mockReturnValue(() => {}),
    }

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            access_token: "test-token",
            expires: Math.floor(Date.now() / 1000) + 3600,
          }),
          { status: 200 }
        )
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("should return fetch function and auth state", () => {
    const result = createBridgedFetch({
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      storage: mockStorage,
    })

    expect(result.fetch).toBeDefined()
    expect(typeof result.fetch).toBe("function")
    expect(result.auth).toBeDefined()
  })

  it("should create fetch that adds authorization header", async () => {
    // Pre-populate storage with a valid token
    const tokenData = {
      access_token: "existing-token",
      expires: Math.floor(Date.now() / 1000) + 3600,
    }
    mockStorage.get = vi.fn().mockReturnValue(JSON.stringify(tokenData))

    const mockFetchFn = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 })
    )
    vi.stubGlobal("fetch", mockFetchFn)

    const { fetch: bridgedFetch } = createBridgedFetch({
      baseUrl: "https://api.test.com",
      clientId: "test-client-id",
      storage: mockStorage,
    })

    await bridgedFetch("https://api.test.com/products")

    const calledRequest = mockFetchFn.mock.calls[0][0] as Request
    expect(calledRequest.headers.get("Authorization")).toBe(
      "Bearer existing-token"
    )
  })
})

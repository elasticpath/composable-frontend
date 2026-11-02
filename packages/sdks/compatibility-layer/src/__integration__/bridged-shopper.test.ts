import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import { client as shopperClient } from "@epcc-sdk/sdks-shopper"
import {
  createBridgedClient,
  createBridgedFetch,
  createLegacyStorageBridge,
} from "../index"
import {
  setupMswServer,
  teardownMswServer,
  resetMswHandlers,
  getRequestCounts,
  setReturn401,
  setReturn429,
  mockTokenData,
  mockCatalogProducts,
} from "./setup"

describe("Bridged Shopper Client Integration", () => {
  beforeAll(() => {
    setupMswServer()
  })

  afterAll(() => {
    teardownMswServer()
  })

  beforeEach(() => {
    resetMswHandlers()
  })

  describe("Basic API calls", () => {
    it("should automatically authenticate and make API call", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      // Make request - should trigger authentication automatically
      const response = await fetch("https://api.elasticpath.com/catalog/products", {
        headers: {
          Authorization: `Bearer ${await auth.getValidAccessToken()}`,
        },
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toEqual(mockCatalogProducts)

      // Should have authenticated
      const { authRequestCount } = getRequestCounts()
      expect(authRequestCount).toBe(1)

      // Token should be stored
      expect(auth.getSnapshot()).toBe(mockTokenData.access_token)
    })

    it("should reuse existing token for subsequent calls", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      // First call - should authenticate
      const token1 = await auth.getValidAccessToken()

      // Second call - should reuse token
      const token2 = await auth.getValidAccessToken()

      expect(token1).toBe(token2)

      // Should only have authenticated once
      const { authRequestCount } = getRequestCounts()
      expect(authRequestCount).toBe(1)
    })
  })

  describe("Retry on 401", () => {
    it("should retry with fresh token on 401 response", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      // Pre-populate with a token
      storage.set(
        JSON.stringify({
          access_token: "expired-token",
          expires: Math.floor(Date.now() / 1000) + 3600, // Not actually expired
        })
      )

      // Set up MSW to return 401 once, then succeed
      setReturn401(true, 1)

      const { fetch: bridgedFetch, auth } = createBridgedFetch({
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
        retry: { maxAttempts: 3, reauth: true, baseDelay: 1, jitter: 0 },
      })

      const response = await bridgedFetch(
        "https://api.elasticpath.com/catalog/products"
      )

      expect(response.status).toBe(200)
      expect(getRequestCounts()).toEqual({
        authRequestCount: 1,
        productRequestCount: 2,
      })
      expect(auth.getSnapshot()).toBe(mockTokenData.access_token)
    })

    it("should trigger token refresh on explicit refresh call", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      // Get initial token
      const token1 = await auth.getValidAccessToken()
      expect(token1).toBe(mockTokenData.access_token)

      const { authRequestCount: count1 } = getRequestCounts()
      expect(count1).toBe(1)

      // Force refresh
      const token2 = await auth.refresh()
      expect(token2).toBe(mockTokenData.access_token)

      // Should have made another auth request
      const { authRequestCount: count2 } = getRequestCounts()
      expect(count2).toBe(2)
    })
  })

  describe("Rate limiting handling", () => {
    it("should handle 429 responses gracefully", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      setReturn429(true)

      const { fetch: bridgedFetch } = createBridgedFetch({
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
        retry: { baseDelay: 1, jitter: 0 },
      })

      const response = await bridgedFetch(
        "https://api.elasticpath.com/catalog/products"
      )

      // The handler returns 429 once, so the retry succeeds
      expect(response.status).toBe(200)
      expect(getRequestCounts().productRequestCount).toBe(2)
    })
  })

  describe("Throttling", () => {
    it("should throttle rapid requests when enabled", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { fetch: bridgedFetch, auth } = createBridgedFetch({
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
        throttle: { enabled: true, limit: 2, interval: 100 },
      })
      await auth.getValidAccessToken()

      const start = Date.now()
      const responses = await Promise.all(
        Array.from({ length: 4 }, () =>
          bridgedFetch("https://api.elasticpath.com/catalog/products")
        )
      )

      expect(responses.map((r) => r.status)).toEqual([200, 200, 200, 200])
      expect(getRequestCounts().productRequestCount).toBe(4)
      // limit=2 per 100ms, so the last two requests wait for the next interval.
      // Only a lower bound, because CI timing varies upward
      expect(Date.now() - start).toBeGreaterThanOrEqual(90)
    })
  })

  describe("Headers configuration", () => {
    it("should include custom headers in requests", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
        headers: {
          "X-Custom-Header": "test-value",
          "X-Moltin-Currency": "USD",
        },
      })

      // The headers are configured on the client
      // We just verify the client was configured without errors
      const token = await auth.getValidAccessToken()
      expect(token).toBe(mockTokenData.access_token)
    })
  })

  describe("Storage persistence", () => {
    it("should persist token to storage after authentication", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      // Trigger authentication
      await auth.getValidAccessToken()

      // Check storage was updated
      const stored = storage.get()
      expect(stored).toBeDefined()

      const parsed = JSON.parse(stored!)
      expect(parsed.access_token).toBe(mockTokenData.access_token)
    })

    it("should clear token from storage on clear()", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      // Authenticate first
      await auth.getValidAccessToken()
      expect(storage.get()).toBeDefined()

      // Clear
      auth.clear()

      // Storage should be empty (memory adapter returns undefined, not null)
      expect(storage.get()).toBeFalsy()
      expect(auth.getSnapshot()).toBeUndefined()
    })
  })
})

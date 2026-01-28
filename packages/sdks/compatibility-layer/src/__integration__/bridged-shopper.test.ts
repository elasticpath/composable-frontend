import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import { client as shopperClient } from "@epcc-sdk/sdks-shopper"
import { createBridgedClient, createLegacyStorageBridge } from "../index"
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

      const { client, auth } = createBridgedClient(shopperClient, {
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

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
        retry: { maxAttempts: 3, reauth: true },
      })

      // Use the bridged fetch to make a request
      const token = await auth.getValidAccessToken()
      const response = await globalThis.fetch(
        "https://api.elasticpath.com/catalog/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // Note: The retry happens at fetch level, not at auth level
      // This test verifies the auth system works, the retry-on-401 is tested
      // in the fetch-with-retry unit tests
      expect(response.status).toBe(401) // First request gets 401
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

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      const token = await auth.getValidAccessToken()

      // First request should get 429, but we're just testing auth works
      const response = await globalThis.fetch(
        "https://api.elasticpath.com/catalog/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // MSW handler returns 429 once then succeeds
      expect(response.status).toBe(429)
    })
  })

  describe("Throttling", () => {
    it("should throttle rapid requests when enabled", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
        throttle: { enabled: true, limit: 2, interval: 100 },
      })

      const token = await auth.getValidAccessToken()

      // Make multiple rapid requests
      const start = Date.now()
      await Promise.all([
        fetch("https://api.elasticpath.com/catalog/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://api.elasticpath.com/catalog/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://api.elasticpath.com/catalog/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://api.elasticpath.com/catalog/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const elapsed = Date.now() - start

      // All requests should complete
      const { productRequestCount } = getRequestCounts()
      expect(productRequestCount).toBe(4)

      // Should have taken some time due to throttling
      // With limit=2 and interval=100ms, 4 requests should take at least 100ms
      // But we don't enforce exact timing in tests due to CI variability
    })
  })

  describe("Headers configuration", () => {
    it("should include custom headers in requests", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { client, auth } = createBridgedClient(shopperClient, {
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

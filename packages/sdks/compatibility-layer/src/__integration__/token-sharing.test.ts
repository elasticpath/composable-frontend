import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import { client as shopperClient } from "@epcc-sdk/sdks-shopper"
import { createBridgedClient, createLegacyStorageBridge } from "../index"
import {
  setupMswServer,
  teardownMswServer,
  resetMswHandlers,
  mockTokenData,
  getRequestCounts,
} from "./setup"

describe("Token Sharing Integration", () => {
  // Use in-memory storage that mimics localStorage for testing
  let storageData: Record<string, string> = {}

  const mockLocalStorage = {
    getItem: (key: string) => storageData[key] ?? null,
    setItem: (key: string, value: string) => {
      storageData[key] = value
    },
    removeItem: (key: string) => {
      delete storageData[key]
    },
    clear: () => {
      storageData = {}
    },
  }

  beforeAll(() => {
    // Setup MSW server
    setupMswServer()

    // Mock localStorage globally
    Object.defineProperty(globalThis, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    })
  })

  afterAll(() => {
    teardownMswServer()
  })

  beforeEach(() => {
    resetMswHandlers()
    storageData = {}
  })

  describe("Old SDK stores token, New SDK reads it", () => {
    it("should allow new SDK to use token stored by old SDK", async () => {
      // Simulate old SDK storing a token
      const oldSdkCredentials = {
        client_id: "test-client-id",
        access_token: mockTokenData.access_token,
        expires: mockTokenData.expires,
        expires_in: mockTokenData.expires_in,
        identifier: "implicit",
        token_type: "Bearer",
      }
      storageData["epCredentials"] = JSON.stringify(oldSdkCredentials)

      // Create bridged client that reads from the same storage
      const storage = createLegacyStorageBridge({
        backend: "memory",
      })
      // Manually set the storage to mimic the shared localStorage
      storage.set(JSON.stringify(oldSdkCredentials))

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      // New SDK should be able to get the token without making an auth request
      const token = await auth.getValidAccessToken()

      expect(token).toBe(mockTokenData.access_token)
    })

    it("should share the same storage key format", async () => {
      // Old SDK uses 'epCredentials' by default
      const storage = createLegacyStorageBridge({
        key: "epCredentials",
        backend: "memory",
      })

      // The storage adapter should use the same key
      storage.set(JSON.stringify({ access_token: "shared-token", expires: Date.now() / 1000 + 3600 }))

      const storedValue = storage.get()
      expect(storedValue).toBeDefined()

      const parsed = JSON.parse(storedValue!)
      expect(parsed.access_token).toBe("shared-token")
    })
  })

  describe("Token format compatibility", () => {
    it("should handle old SDK token format with all fields", () => {
      const oldSdkFormat = {
        client_id: "test-client-id",
        access_token: "old-format-token",
        expires: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        identifier: "implicit",
        token_type: "Bearer",
      }

      const storage = createLegacyStorageBridge({ backend: "memory" })
      storage.set(JSON.stringify(oldSdkFormat))

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      // Should be able to read the token
      expect(auth.getSnapshot()).toBe("old-format-token")
      expect(auth.isExpired()).toBe(false)
    })

    it("should handle minimal token format", () => {
      const minimalFormat = {
        access_token: "minimal-token",
      }

      const storage = createLegacyStorageBridge({ backend: "memory" })
      storage.set(JSON.stringify(minimalFormat))

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      expect(auth.getSnapshot()).toBe("minimal-token")
      // Without expires, should be considered expired
      expect(auth.isExpired()).toBe(true)
    })

    it("should write tokens in format compatible with old SDK", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      // Trigger a token refresh which will write to storage
      await auth.refresh()

      const storedValue = storage.get()
      expect(storedValue).toBeDefined()

      const parsed = JSON.parse(storedValue!)

      // Should have the fields old SDK expects
      expect(parsed.access_token).toBeDefined()
      expect(parsed.expires).toBeDefined()
      expect(typeof parsed.expires).toBe("number")
    })
  })

  describe("Named gateway support", () => {
    it("should support named storage keys like old SDK", () => {
      // Old SDK with name: gateway({ name: 'myapp', ... })
      // stores to 'myapp_ep_credentials'
      const namedStorage = createLegacyStorageBridge({
        name: "myapp",
        backend: "memory",
      })

      namedStorage.set(JSON.stringify({
        access_token: "named-token",
        expires: Math.floor(Date.now() / 1000) + 3600,
      }))

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage: namedStorage,
      })

      expect(auth.getSnapshot()).toBe("named-token")
    })
  })

  describe("Concurrent token refresh deduplication", () => {
    it("should only make one auth request for concurrent refreshes", async () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage,
      })

      // Trigger multiple concurrent refreshes
      const [token1, token2, token3] = await Promise.all([
        auth.refresh(),
        auth.refresh(),
        auth.refresh(),
      ])

      // All should return the same token
      expect(token1).toBe(token2)
      expect(token2).toBe(token3)

      // Should only have made one auth request
      const { authRequestCount } = getRequestCounts()
      expect(authRequestCount).toBe(1)
    })

    it("should handle concurrent re-auth from multiple clients sharing same storage", async () => {
      // Create a SHARED storage adapter (simulating old SDK + new SDK sharing localStorage)
      const sharedStorage = createLegacyStorageBridge({ backend: "memory" })

      // Pre-populate with an EXPIRED token
      sharedStorage.set(
        JSON.stringify({
          access_token: "expired-token",
          expires: Math.floor(Date.now() / 1000) - 100, // Expired 100 seconds ago
        })
      )

      // Create TWO bridged clients sharing the SAME storage
      // This simulates old SDK and new SDK both detecting expired token
      const { auth: client1Auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage: sharedStorage,
      })

      const { auth: client2Auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage: sharedStorage,
      })

      // Both clients detect expired token and try to refresh concurrently
      const [token1, token2] = await Promise.all([
        client1Auth.getValidAccessToken(),
        client2Auth.getValidAccessToken(),
      ])

      // Both should end up with the same valid token
      expect(token1).toBe(mockTokenData.access_token)
      expect(token2).toBe(mockTokenData.access_token)

      // Ideally only 1-2 auth requests (each client has its own deduplication)
      // Since they're separate SharedAuthState instances, each may make one request
      // but they should both end up reading the same token from storage
      const { authRequestCount } = getRequestCounts()
      expect(authRequestCount).toBeLessThanOrEqual(2)

      // Verify storage has the new token
      const storedValue = sharedStorage.get()
      const parsed = JSON.parse(storedValue!)
      expect(parsed.access_token).toBe(mockTokenData.access_token)
    })

    it("should allow second client to use token refreshed by first client", async () => {
      const sharedStorage = createLegacyStorageBridge({ backend: "memory" })

      // Start with expired token
      sharedStorage.set(
        JSON.stringify({
          access_token: "old-expired-token",
          expires: Math.floor(Date.now() / 1000) - 100,
        })
      )

      // First client refreshes the token
      const { auth: client1Auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage: sharedStorage,
      })

      const token1 = await client1Auth.getValidAccessToken()
      expect(token1).toBe(mockTokenData.access_token)

      const { authRequestCount: countAfterFirst } = getRequestCounts()
      expect(countAfterFirst).toBe(1)

      // Second client should read the refreshed token from storage
      // without making another auth request
      const { auth: client2Auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage: sharedStorage,
      })

      const token2 = await client2Auth.getValidAccessToken()
      expect(token2).toBe(mockTokenData.access_token)

      // Should NOT have made another auth request
      const { authRequestCount: countAfterSecond } = getRequestCounts()
      expect(countAfterSecond).toBe(1)
    })
  })
})

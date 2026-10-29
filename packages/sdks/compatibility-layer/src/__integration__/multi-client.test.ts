import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import { client as shopperClient } from "@epcc-sdk/sdks-shopper"
import { client as pimClient } from "@epcc-sdk/sdks-pxm"
import {
  createBridgedClient,
  createLegacyStorageBridge,
  clientRegistry,
} from "../index"
import {
  setupMswServer,
  teardownMswServer,
  resetMswHandlers,
  getRequestCounts,
  mockTokenData,
  mockClientCredentialsToken,
} from "./setup"

describe("Multi-Client Integration", () => {
  beforeAll(() => {
    setupMswServer()
  })

  afterAll(() => {
    teardownMswServer()
  })

  beforeEach(() => {
    resetMswHandlers()
    // Clear the client registry between tests
    clientRegistry.remove("shopper")
    clientRegistry.remove("admin")
    clientRegistry.remove("pim")
  })

  describe("Independent client instances", () => {
    it("should maintain separate auth states for shopper and PIM clients", async () => {
      // Create shopper client (implicit grant)
      const shopperStorage = createLegacyStorageBridge({
        backend: "memory",
        name: "shopper",
      })
      const { auth: shopperAuth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "shopper-client-id",
        storage: shopperStorage,
      })

      // Create PIM client (client_credentials grant)
      const pimStorage = createLegacyStorageBridge({
        backend: "memory",
        name: "pim",
      })
      const { auth: pimAuth } = createBridgedClient(pimClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "admin-client-id",
        clientSecret: "admin-secret",
        storage: pimStorage,
      })

      // Get tokens for both clients
      const shopperToken = await shopperAuth.getValidAccessToken()
      const pimToken = await pimAuth.getValidAccessToken()

      // Tokens should be different (implicit vs client_credentials)
      expect(shopperToken).toBe(mockTokenData.access_token)
      expect(pimToken).toBe(mockClientCredentialsToken.access_token)
      expect(shopperToken).not.toBe(pimToken)

      // Both should have made auth requests
      const { authRequestCount } = getRequestCounts()
      expect(authRequestCount).toBe(2)
    })

    it("should not affect other clients when one refreshes", async () => {
      const shopperStorage = createLegacyStorageBridge({
        backend: "memory",
        name: "shopper",
      })
      const { auth: shopperAuth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "shopper-client-id",
        storage: shopperStorage,
      })

      const pimStorage = createLegacyStorageBridge({
        backend: "memory",
        name: "pim",
      })
      const { auth: pimAuth } = createBridgedClient(pimClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "admin-client-id",
        clientSecret: "admin-secret",
        storage: pimStorage,
      })

      // Initial auth for both
      await shopperAuth.getValidAccessToken()
      await pimAuth.getValidAccessToken()

      const { authRequestCount: initialCount } = getRequestCounts()
      expect(initialCount).toBe(2)

      // Refresh only shopper
      await shopperAuth.refresh()

      const { authRequestCount: afterRefresh } = getRequestCounts()
      expect(afterRefresh).toBe(3) // Only one additional request

      // PIM auth should still have its token
      expect(pimAuth.getSnapshot()).toBe(mockClientCredentialsToken.access_token)
    })
  })

  describe("Client registry", () => {
    it("should create and manage multiple named clients", async () => {
      // Create shopper client via registry
      const { auth: shopperAuth } = clientRegistry.getOrCreate({
        name: "shopper",
        authType: "implicit",
        baseUrl: "https://api.elasticpath.com",
        clientId: "shopper-client-id",
        storage: "memory",
      })

      // Create admin client via registry
      const { auth: adminAuth } = clientRegistry.getOrCreate({
        name: "admin",
        authType: "client_credentials",
        baseUrl: "https://api.elasticpath.com",
        clientId: "admin-client-id",
        clientSecret: "admin-secret",
        storage: "memory",
      })

      // Get tokens
      await shopperAuth.getValidAccessToken()
      await adminAuth.getValidAccessToken()

      // Should have both auth requests
      const { authRequestCount } = getRequestCounts()
      expect(authRequestCount).toBe(2)
    })

    it("should return same client instance for same name", async () => {
      const { fetch: fetch1, auth: auth1 } = clientRegistry.getOrCreate({
        name: "shopper",
        authType: "implicit",
        baseUrl: "https://api.elasticpath.com",
        clientId: "shopper-client-id",
        storage: "memory",
      })

      const { fetch: fetch2, auth: auth2 } = clientRegistry.getOrCreate({
        name: "shopper",
        authType: "implicit",
        baseUrl: "https://api.elasticpath.com",
        clientId: "shopper-client-id",
        storage: "memory",
      })

      // Should be same instance
      expect(fetch1).toBe(fetch2)
      expect(auth1).toBe(auth2)
    })

    it("should remove client from registry", async () => {
      const { auth: auth1 } = clientRegistry.getOrCreate({
        name: "temp-client",
        authType: "implicit",
        baseUrl: "https://api.elasticpath.com",
        clientId: "temp-client-id",
        storage: "memory",
      })

      await auth1.getValidAccessToken()
      expect(auth1.getSnapshot()).toBe(mockTokenData.access_token)

      // Remove client
      clientRegistry.remove("temp-client")

      // Getting client with same name should create new instance
      const { auth: auth2 } = clientRegistry.getOrCreate({
        name: "temp-client",
        authType: "implicit",
        baseUrl: "https://api.elasticpath.com",
        clientId: "temp-client-id",
        storage: "memory",
      })

      // New instance should not have token
      expect(auth2.getSnapshot()).toBeUndefined()
      expect(auth1).not.toBe(auth2)
    })
  })

  describe("Concurrent requests across clients", () => {
    it("should handle concurrent requests from multiple clients", async () => {
      const shopperStorage = createLegacyStorageBridge({
        backend: "memory",
        name: "shopper",
      })
      const { auth: shopperAuth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "shopper-client-id",
        storage: shopperStorage,
      })

      const pimStorage = createLegacyStorageBridge({
        backend: "memory",
        name: "pim",
      })
      const { auth: pimAuth } = createBridgedClient(pimClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "admin-client-id",
        clientSecret: "admin-secret",
        storage: pimStorage,
      })

      // Make concurrent requests from both clients
      const [shopperToken, pimToken, shopperToken2, pimToken2] =
        await Promise.all([
          shopperAuth.getValidAccessToken(),
          pimAuth.getValidAccessToken(),
          shopperAuth.getValidAccessToken(),
          pimAuth.getValidAccessToken(),
        ])

      // All shopper requests should get same token
      expect(shopperToken).toBe(shopperToken2)
      expect(shopperToken).toBe(mockTokenData.access_token)

      // All PIM requests should get same token
      expect(pimToken).toBe(pimToken2)
      expect(pimToken).toBe(mockClientCredentialsToken.access_token)

      // Should only have 2 auth requests (one per client, deduplicated)
      const { authRequestCount } = getRequestCounts()
      expect(authRequestCount).toBe(2)
    })
  })

  describe("Different storage backends", () => {
    it("should support memory storage for server-side clients", async () => {
      const { auth } = createBridgedClient(pimClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "admin-client-id",
        clientSecret: "admin-secret",
        storage: "memory",
      })

      const token = await auth.getValidAccessToken()
      expect(token).toBe(mockClientCredentialsToken.access_token)
    })

    it("should support custom storage adapter", async () => {
      const customStorage: Record<string, string | null> = {}
      const adapter = {
        get: () => customStorage["token"] ?? null,
        set: (value: string) => {
          customStorage["token"] = value
        },
        delete: () => {
          customStorage["token"] = null
        },
      }

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage: adapter,
      })

      await auth.getValidAccessToken()

      // Token should be stored in custom storage
      expect(customStorage["token"]).toBeDefined()
      const parsed = JSON.parse(customStorage["token"]!)
      expect(parsed.access_token).toBe(mockTokenData.access_token)
    })
  })

  describe("Token provider customization", () => {
    it("should support custom token provider for SSO", async () => {
      const customTokenProvider = async () => ({
        access_token: "custom-sso-token",
        expires: Math.floor(Date.now() / 1000) + 3600,
        token_type: "Bearer" as const,
      })

      const { auth } = createBridgedClient(shopperClient, {
        baseUrl: "https://api.elasticpath.com",
        clientId: "test-client-id",
        storage: "memory",
        tokenProvider: customTokenProvider,
      })

      const token = await auth.getValidAccessToken()

      // Should use custom token provider
      expect(token).toBe("custom-sso-token")

      // Should NOT have made any auth requests to the server
      const { authRequestCount } = getRequestCounts()
      expect(authRequestCount).toBe(0)
    })
  })
})

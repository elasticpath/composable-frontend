import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { ClientRegistry, clientRegistry } from "./client-registry"

describe("ClientRegistry", () => {
  let registry: ClientRegistry

  beforeEach(() => {
    registry = new ClientRegistry()

    // Mock global fetch for token providers
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
    registry.clear()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe("getOrCreate", () => {
    it("should create a new client instance", () => {
      const instance = registry.getOrCreate({
        name: "test-client",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "test-client-id",
        storage: "memory",
      })

      expect(instance).toBeDefined()
      expect(instance.fetch).toBeDefined()
      expect(instance.auth).toBeDefined()
      expect(instance.config.name).toBe("test-client")
    })

    it("should return existing client on subsequent calls", () => {
      const config = {
        name: "test-client",
        authType: "implicit" as const,
        baseUrl: "https://api.test.com",
        clientId: "test-client-id",
        storage: "memory" as const,
      }

      const instance1 = registry.getOrCreate(config)
      const instance2 = registry.getOrCreate(config)

      expect(instance1).toBe(instance2)
    })

    it("should create separate instances for different names", () => {
      const instance1 = registry.getOrCreate({
        name: "client-1",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "client-id-1",
        storage: "memory",
      })

      const instance2 = registry.getOrCreate({
        name: "client-2",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "client-id-2",
        storage: "memory",
      })

      expect(instance1).not.toBe(instance2)
      expect(instance1.config.name).toBe("client-1")
      expect(instance2.config.name).toBe("client-2")
    })

    it("should support client_credentials auth type", () => {
      const instance = registry.getOrCreate({
        name: "admin-client",
        authType: "client_credentials",
        baseUrl: "https://api.test.com",
        clientId: "admin-client-id",
        clientSecret: "admin-secret",
        storage: "memory",
      })

      expect(instance).toBeDefined()
    })

    it("should throw for client_credentials without secret", () => {
      expect(() =>
        registry.getOrCreate({
          name: "admin-client",
          authType: "client_credentials",
          baseUrl: "https://api.test.com",
          clientId: "admin-client-id",
          storage: "memory",
        })
      ).toThrow("Client secret required")
    })

    it("should support password auth type (manual token)", async () => {
      const instance = registry.getOrCreate({
        name: "password-client",
        authType: "password",
        baseUrl: "https://api.test.com",
        clientId: "client-id",
        storage: "memory",
      })

      // Should throw when trying to auto-refresh
      await expect(instance.auth.refresh()).rejects.toThrow(
        "requires manual token setting"
      )

      // But should work with manual token
      instance.auth.setToken({
        access_token: "manual-token",
        expires: Math.floor(Date.now() / 1000) + 3600,
      })

      expect(instance.auth.getSnapshot()).toBe("manual-token")
    })

    it("should support sso auth type (manual token)", async () => {
      const instance = registry.getOrCreate({
        name: "sso-client",
        authType: "sso",
        baseUrl: "https://api.test.com",
        clientId: "client-id",
        storage: "memory",
      })

      await expect(instance.auth.refresh()).rejects.toThrow(
        "requires manual token setting"
      )
    })

    it("should support jwt auth type (manual token)", async () => {
      const instance = registry.getOrCreate({
        name: "jwt-client",
        authType: "jwt",
        baseUrl: "https://api.test.com",
        clientId: "client-id",
        storage: "memory",
      })

      await expect(instance.auth.refresh()).rejects.toThrow(
        "requires manual token setting"
      )
    })
  })

  describe("get", () => {
    it("should return undefined for non-existent client", () => {
      expect(registry.get("non-existent")).toBeUndefined()
    })

    it("should return existing client", () => {
      registry.getOrCreate({
        name: "existing-client",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "client-id",
        storage: "memory",
      })

      const instance = registry.get("existing-client")
      expect(instance).toBeDefined()
      expect(instance?.config.name).toBe("existing-client")
    })
  })

  describe("has", () => {
    it("should return false for non-existent client", () => {
      expect(registry.has("non-existent")).toBe(false)
    })

    it("should return true for existing client", () => {
      registry.getOrCreate({
        name: "existing-client",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "client-id",
        storage: "memory",
      })

      expect(registry.has("existing-client")).toBe(true)
    })
  })

  describe("remove", () => {
    it("should return false for non-existent client", () => {
      expect(registry.remove("non-existent")).toBe(false)
    })

    it("should remove and dispose client", () => {
      const instance = registry.getOrCreate({
        name: "client-to-remove",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "client-id",
        storage: "memory",
      })

      const disposeSpy = vi.spyOn(instance.auth, "dispose")

      const result = registry.remove("client-to-remove")

      expect(result).toBe(true)
      expect(disposeSpy).toHaveBeenCalled()
      expect(registry.has("client-to-remove")).toBe(false)
    })
  })

  describe("names", () => {
    it("should return empty array when no clients", () => {
      expect(registry.names()).toEqual([])
    })

    it("should return all client names", () => {
      registry.getOrCreate({
        name: "client-1",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "client-id-1",
        storage: "memory",
      })

      registry.getOrCreate({
        name: "client-2",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "client-id-2",
        storage: "memory",
      })

      expect(registry.names()).toContain("client-1")
      expect(registry.names()).toContain("client-2")
      expect(registry.names()).toHaveLength(2)
    })
  })

  describe("clear", () => {
    it("should remove all clients and dispose them", () => {
      const instance1 = registry.getOrCreate({
        name: "client-1",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "client-id-1",
        storage: "memory",
      })

      const instance2 = registry.getOrCreate({
        name: "client-2",
        authType: "implicit",
        baseUrl: "https://api.test.com",
        clientId: "client-id-2",
        storage: "memory",
      })

      const disposeSpy1 = vi.spyOn(instance1.auth, "dispose")
      const disposeSpy2 = vi.spyOn(instance2.auth, "dispose")

      registry.clear()

      expect(disposeSpy1).toHaveBeenCalled()
      expect(disposeSpy2).toHaveBeenCalled()
      expect(registry.names()).toEqual([])
    })
  })
})

describe("clientRegistry (singleton)", () => {
  afterEach(() => {
    clientRegistry.clear()
    vi.unstubAllGlobals()
  })

  it("should be a global singleton instance", () => {
    expect(clientRegistry).toBeInstanceOf(ClientRegistry)
  })

  it("should work as expected", () => {
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

    const instance = clientRegistry.getOrCreate({
      name: "singleton-client",
      authType: "implicit",
      baseUrl: "https://api.test.com",
      clientId: "client-id",
      storage: "memory",
    })

    expect(instance).toBeDefined()
    expect(clientRegistry.has("singleton-client")).toBe(true)
  })
})

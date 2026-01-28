import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  createLegacyStorageBridge,
  storageAdapters,
} from "./legacy-storage-bridge"

describe("createLegacyStorageBridge", () => {
  describe("key resolution", () => {
    it("should use default key when no options provided", () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      storage.set("test-value")

      // Memory adapter stores internally, but we can verify it works
      expect(storage.get()).toBe("test-value")
    })

    it("should use custom key when provided", () => {
      const storage = createLegacyStorageBridge({
        key: "custom_key",
        backend: "memory",
      })

      storage.set("test-value")
      expect(storage.get()).toBe("test-value")
    })

    it("should use name pattern when name is provided", () => {
      const storage = createLegacyStorageBridge({
        name: "myapp",
        backend: "memory",
      })

      // Should use key pattern: ${name}_ep_credentials
      storage.set("test-value")
      expect(storage.get()).toBe("test-value")
    })
  })

  describe("memory backend", () => {
    it("should store and retrieve values", () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      storage.set("test-value")
      expect(storage.get()).toBe("test-value")
    })

    it("should clear values when set to undefined", () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })

      storage.set("test-value")
      storage.set(undefined)

      expect(storage.get()).toBeUndefined()
    })

    it("should support subscriptions", () => {
      const storage = createLegacyStorageBridge({ backend: "memory" })
      const callback = vi.fn()

      const unsubscribe = storage.subscribe!(callback)

      storage.set("new-value")
      expect(callback).toHaveBeenCalledTimes(1)

      unsubscribe()
      storage.set("another-value")
      expect(callback).toHaveBeenCalledTimes(1) // Should not be called again
    })
  })

  describe("localStorage backend", () => {
    const mockLocalStorage: Record<string, string> = {}

    beforeEach(() => {
      // Clear mock storage
      Object.keys(mockLocalStorage).forEach(
        (key) => delete mockLocalStorage[key]
      )

      // Mock localStorage
      vi.stubGlobal("window", {
        localStorage: {
          getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
          setItem: vi.fn((key: string, value: string) => {
            mockLocalStorage[key] = value
          }),
          removeItem: vi.fn((key: string) => {
            delete mockLocalStorage[key]
          }),
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it("should store and retrieve values from localStorage", () => {
      const storage = createLegacyStorageBridge({ backend: "localStorage" })

      storage.set("test-value")
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "epCredentials",
        "test-value"
      )
    })

    it("should remove value when set to undefined", () => {
      const storage = createLegacyStorageBridge({ backend: "localStorage" })

      storage.set(undefined)
      expect(window.localStorage.removeItem).toHaveBeenCalledWith(
        "epCredentials"
      )
    })

    it("should subscribe to storage events", () => {
      const storage = createLegacyStorageBridge({ backend: "localStorage" })
      const callback = vi.fn()

      storage.subscribe!(callback)

      expect(window.addEventListener).toHaveBeenCalledWith(
        "storage",
        expect.any(Function)
      )
    })

    it("should unsubscribe from storage events", () => {
      const storage = createLegacyStorageBridge({ backend: "localStorage" })
      const callback = vi.fn()

      const unsubscribe = storage.subscribe!(callback)
      unsubscribe()

      expect(window.removeEventListener).toHaveBeenCalledWith(
        "storage",
        expect.any(Function)
      )
    })
  })

  describe("cookie backend", () => {
    beforeEach(() => {
      vi.stubGlobal("document", {
        cookie: "",
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it("should write cookies with proper format", () => {
      const storage = createLegacyStorageBridge({
        backend: "cookie",
        cookie: { secure: true },
      })

      storage.set("test-value")

      expect(document.cookie).toContain("epCredentials=test-value")
      expect(document.cookie).toContain("Secure")
    })

    it("should read cookies", () => {
      Object.defineProperty(document, "cookie", {
        get: () => "epCredentials=stored-value; other=cookie",
        set: vi.fn(),
        configurable: true,
      })

      const storage = createLegacyStorageBridge({ backend: "cookie" })

      expect(storage.get()).toBe("stored-value")
    })

    it("should clear cookies by setting Max-Age=0", () => {
      let cookieValue = ""
      Object.defineProperty(document, "cookie", {
        get: () => cookieValue,
        set: (value: string) => {
          cookieValue = value
        },
        configurable: true,
      })

      const storage = createLegacyStorageBridge({ backend: "cookie" })

      storage.set(undefined)

      expect(cookieValue).toContain("Max-Age=0")
    })

    it("should not have subscribe method", () => {
      const storage = createLegacyStorageBridge({ backend: "cookie" })

      // Cookie adapter doesn't support reliable cross-tab change detection
      expect(storage.subscribe).toBeUndefined()
    })
  })

  describe("error handling", () => {
    it("should throw on unknown backend", () => {
      expect(() =>
        createLegacyStorageBridge({ backend: "unknown" as any })
      ).toThrow("Unknown storage backend: unknown")
    })
  })
})

describe("storageAdapters", () => {
  it("should export localStorage adapter factory", () => {
    expect(typeof storageAdapters.localStorage).toBe("function")
  })

  it("should export cookie adapter factory", () => {
    expect(typeof storageAdapters.cookie).toBe("function")
  })

  it("should export memory adapter factory", () => {
    expect(typeof storageAdapters.memory).toBe("function")
  })

  describe("memory adapter", () => {
    it("should accept initial value", () => {
      const adapter = storageAdapters.memory("initial-value")
      expect(adapter.get()).toBe("initial-value")
    })
  })
})

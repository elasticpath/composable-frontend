import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { SharedAuthState } from "./shared-auth-state"
import type { StorageAdapter, TokenData, TokenProvider } from "../types"

describe("SharedAuthState", () => {
  let mockStorage: StorageAdapter
  let mockTokenProvider: TokenProvider
  let storedValue: string | undefined

  beforeEach(() => {
    storedValue = undefined
    mockStorage = {
      get: vi.fn(() => storedValue),
      set: vi.fn((value) => {
        storedValue = value
      }),
      subscribe: vi.fn().mockReturnValue(() => {}),
    }

    mockTokenProvider = vi.fn().mockResolvedValue({
      access_token: "new-token",
      expires: Math.floor(Date.now() / 1000) + 3600,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("constructor", () => {
    it("should load credentials from storage on initialization", () => {
      const tokenData: TokenData = {
        access_token: "stored-token",
        expires: Math.floor(Date.now() / 1000) + 3600,
      }
      storedValue = JSON.stringify(tokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      expect(authState.getSnapshot()).toBe("stored-token")
    })

    it("should handle legacy plain token format", () => {
      storedValue = "plain-token"

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      expect(authState.getSnapshot()).toBe("plain-token")
    })

    it("should subscribe to storage changes", () => {
      new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      expect(mockStorage.subscribe).toHaveBeenCalled()
    })
  })

  describe("isExpired", () => {
    it("should return true when no credentials", () => {
      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      expect(authState.isExpired()).toBe(true)
    })

    it("should return false when token is not expired", () => {
      const tokenData: TokenData = {
        access_token: "valid-token",
        expires: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      }
      storedValue = JSON.stringify(tokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      expect(authState.isExpired()).toBe(false)
    })

    it("should return true when token is expired", () => {
      const tokenData: TokenData = {
        access_token: "expired-token",
        expires: Math.floor(Date.now() / 1000) - 100, // 100 seconds ago
      }
      storedValue = JSON.stringify(tokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      expect(authState.isExpired()).toBe(true)
    })

    it("should respect leeway setting", () => {
      const tokenData: TokenData = {
        access_token: "almost-expired-token",
        expires: Math.floor(Date.now() / 1000) + 30, // 30 seconds from now
      }
      storedValue = JSON.stringify(tokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
        leewaySec: 60, // 60 second leeway
      })

      // Token expires in 30s but leeway is 60s, so should be considered expired
      expect(authState.isExpired()).toBe(true)
    })

    it("should consider token expired when no expires field present", () => {
      // Token without an expires field should be considered expired
      // (EP tokens always have an expires field, this handles edge cases)
      const tokenData: TokenData = {
        access_token: "token-without-expires",
      }
      storedValue = JSON.stringify(tokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      expect(authState.isExpired()).toBe(true)
    })
  })

  describe("getValidAccessToken", () => {
    it("should return cached token if valid", async () => {
      const tokenData: TokenData = {
        access_token: "valid-token",
        expires: Math.floor(Date.now() / 1000) + 3600,
      }
      storedValue = JSON.stringify(tokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      const token = await authState.getValidAccessToken()

      expect(token).toBe("valid-token")
      expect(mockTokenProvider).not.toHaveBeenCalled()
    })

    it("should refresh if token is expired", async () => {
      const expiredTokenData: TokenData = {
        access_token: "expired-token",
        expires: Math.floor(Date.now() / 1000) - 100,
      }
      storedValue = JSON.stringify(expiredTokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      const token = await authState.getValidAccessToken()

      expect(token).toBe("new-token")
      expect(mockTokenProvider).toHaveBeenCalledTimes(1)
    })
  })

  describe("refresh", () => {
    it("should call token provider and store result", async () => {
      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      const token = await authState.refresh()

      expect(token).toBe("new-token")
      expect(mockTokenProvider).toHaveBeenCalledTimes(1)
      expect(mockStorage.set).toHaveBeenCalledTimes(1)

      // Verify the stored value contains the expected token
      const storedValue = (mockStorage.set as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(storedValue)
      expect(parsed.access_token).toBe("new-token")
      expect(typeof parsed.expires).toBe("number")
    })

    it("should deduplicate concurrent refresh calls", async () => {
      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      // Call refresh multiple times concurrently
      const [token1, token2, token3] = await Promise.all([
        authState.refresh(),
        authState.refresh(),
        authState.refresh(),
      ])

      expect(token1).toBe("new-token")
      expect(token2).toBe("new-token")
      expect(token3).toBe("new-token")
      // Should only call provider once due to deduplication
      expect(mockTokenProvider).toHaveBeenCalledTimes(1)
    })

    it("should pass current token to provider", async () => {
      const tokenData: TokenData = {
        access_token: "current-token",
        expires: Math.floor(Date.now() / 1000) + 3600,
      }
      storedValue = JSON.stringify(tokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      await authState.refresh()

      expect(mockTokenProvider).toHaveBeenCalledWith({
        current: "current-token",
      })
    })
  })

  describe("setToken", () => {
    it("should set token and store in storage", () => {
      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      const tokenData: TokenData = {
        access_token: "manual-token",
        expires: Math.floor(Date.now() / 1000) + 3600,
      }

      authState.setToken(tokenData)

      expect(authState.getSnapshot()).toBe("manual-token")
      expect(mockStorage.set).toHaveBeenCalledWith(JSON.stringify(tokenData))
    })

    it("should notify subscribers", () => {
      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      const subscriber = vi.fn()
      authState.subscribe(subscriber)

      authState.setToken({ access_token: "new-token" })

      expect(subscriber).toHaveBeenCalled()
    })
  })

  describe("clear", () => {
    it("should clear credentials and storage", () => {
      const tokenData: TokenData = {
        access_token: "token-to-clear",
        expires: Math.floor(Date.now() / 1000) + 3600,
      }
      storedValue = JSON.stringify(tokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      authState.clear()

      expect(authState.getSnapshot()).toBeUndefined()
      expect(mockStorage.set).toHaveBeenCalledWith(undefined)
    })
  })

  describe("subscribe", () => {
    it("should call subscriber on auth changes", () => {
      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      const subscriber = vi.fn()
      authState.subscribe(subscriber)

      authState.setToken({ access_token: "new-token" })

      expect(subscriber).toHaveBeenCalledTimes(1)
    })

    it("should return unsubscribe function", () => {
      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      const subscriber = vi.fn()
      const unsubscribe = authState.subscribe(subscriber)

      unsubscribe()
      authState.setToken({ access_token: "new-token" })

      expect(subscriber).not.toHaveBeenCalled()
    })
  })

  describe("getCredentials", () => {
    it("should return full credentials object", () => {
      const tokenData: TokenData = {
        access_token: "token",
        expires: 12345,
        client_id: "client-123",
      }
      storedValue = JSON.stringify(tokenData)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      expect(authState.getCredentials()).toEqual(tokenData)
    })
  })

  describe("dispose", () => {
    it("should unsubscribe from storage and clear subscribers", () => {
      const unsubscribeFn = vi.fn()
      mockStorage.subscribe = vi.fn().mockReturnValue(unsubscribeFn)

      const authState = new SharedAuthState({
        storage: mockStorage,
        tokenProvider: mockTokenProvider,
      })

      const subscriber = vi.fn()
      authState.subscribe(subscriber)

      authState.dispose()

      expect(unsubscribeFn).toHaveBeenCalled()

      // Subscriber should not be called after dispose
      authState.setToken({ access_token: "test" })
      expect(subscriber).not.toHaveBeenCalled()
    })
  })
})

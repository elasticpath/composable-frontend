import { describe, it, expect, vi, beforeEach } from "vitest"
import { createAuthLocalStorageInterceptor } from "./auth-local-storage-interceptor"
import { createAnAccessToken } from "../client"
import { CREDENTIALS_STORAGE_KEY } from "../constants/crendentials"
import { tokenExpired } from "../utils/token-expired"
import type { Client } from "@hey-api/client-fetch"

// Mock modules
vi.mock("../client", () => ({
  createAnAccessToken: vi.fn(),
}))

vi.mock("../utils/token-expired", () => ({
  tokenExpired: vi.fn(),
}))

describe("createAuthLocalStorageInterceptor", () => {
  // Type for mocking the Request object
  type MockRequestHeaders = {
    set: ReturnType<typeof vi.fn>
    get: ReturnType<typeof vi.fn>
  }

  type MockRequest = {
    url: string
    headers: MockRequestHeaders
    // Additional properties needed for the Request interface
    method: string
    credentials?: string
    [key: string]: any
  }

  // Mock request options using compatible method type
  const mockOptions = {
    url: "https://api.example.com",
    method: "GET" as const, // Use const assertion to ensure correct type
    headers: {},
  }

  // Mock request
  const mockRequest: MockRequest = {
    url: "https://api.example.com/products",
    headers: {
      set: vi.fn(),
      get: vi.fn(),
    },
    method: "GET",
  }

  // Setup before each test
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()

    // Default tokenExpired mock
    vi.mocked(tokenExpired).mockReturnValue(false)

    // Default createAnAccessToken mock with minimal required properties
    vi.mocked(createAnAccessToken).mockResolvedValue({
      data: {
        access_token: "new-token-123",
        token_type: "Bearer",
        expires: Date.now() + 3600000, // 1 hour in the future
      },
      request: {} as any,
      response: {} as any,
    })
  })

  it("should bypass token logic for oauth requests", async () => {
    const interceptor = createAuthLocalStorageInterceptor({
      clientId: "test-client",
    })

    const oauthRequest: MockRequest = {
      ...mockRequest,
      url: "https://api.example.com/oauth/access_token",
      headers: { set: vi.fn(), get: vi.fn() },
    }

    const result = await interceptor(oauthRequest as any, mockOptions)

    // Should not call localStorage or token creation
    expect(localStorage.getItem).not.toHaveBeenCalled()
    expect(createAnAccessToken).not.toHaveBeenCalled()
    expect(result).toBe(oauthRequest)
  })

  it("should create a new token when one does not exist and autoStoreCredentials is true", async () => {
    const interceptor = createAuthLocalStorageInterceptor({
      clientId: "test-client",
      autoStoreCredentials: true,
    })

    vi.mocked(localStorage.getItem).mockReturnValueOnce("{}")

    await interceptor(mockRequest as any, mockOptions)

    // Should create a new token
    expect(createAnAccessToken).toHaveBeenCalledWith({
      body: {
        grant_type: "implicit",
        client_id: "test-client",
      },
    })

    // Should store the new token - check with more flexible matcher
    expect(localStorage.setItem).toHaveBeenCalledWith(
      CREDENTIALS_STORAGE_KEY,
      expect.any(String),
    )

    // Verify token data structure in saved token
    const setItemCall = vi.mocked(localStorage.setItem).mock.calls[0]
    const savedToken = JSON.parse(setItemCall[1])
    expect(savedToken).toEqual(
      expect.objectContaining({
        access_token: "new-token-123",
        token_type: "Bearer",
        expires: expect.any(Number),
      }),
    )

    // Should set the Authorization header
    expect(mockRequest.headers.set).toHaveBeenCalledWith(
      "Authorization",
      "Bearer new-token-123",
    )
  })

  it("should not create a new token when one does not exist and autoStoreCredentials is false", async () => {
    const interceptor = createAuthLocalStorageInterceptor({
      clientId: "test-client",
      autoStoreCredentials: false,
    })

    vi.mocked(localStorage.getItem).mockReturnValueOnce("{}")

    await interceptor(mockRequest as any, mockOptions)

    // Should not create a new token
    expect(createAnAccessToken).not.toHaveBeenCalled()

    // Should not store anything
    expect(localStorage.setItem).not.toHaveBeenCalled()

    // Should not set the Authorization header
    expect(mockRequest.headers.set).not.toHaveBeenCalled()
  })

  it("should refresh expired token when autoRefresh is true", async () => {
    const interceptor = createAuthLocalStorageInterceptor({
      clientId: "test-client",
      autoRefresh: true,
    })

    // Mock existing token in localStorage
    const existingToken = {
      access_token: "expired-token-123",
      token_type: "Bearer",
      expires: Date.now() - 1000, // Expired token
    }

    vi.mocked(localStorage.getItem).mockReturnValueOnce(
      JSON.stringify(existingToken),
    )

    // Mock token expired check
    vi.mocked(tokenExpired).mockReturnValueOnce(true)

    await interceptor(mockRequest as any, mockOptions)

    // Should refresh the token
    expect(createAnAccessToken).toHaveBeenCalled()

    // Should store the new token - check with more flexible matcher
    expect(localStorage.setItem).toHaveBeenCalledWith(
      CREDENTIALS_STORAGE_KEY,
      expect.any(String),
    )

    // Verify token data structure in saved token
    const setItemCall = vi.mocked(localStorage.setItem).mock.calls[0]
    const savedToken = JSON.parse(setItemCall[1])
    expect(savedToken).toEqual(
      expect.objectContaining({
        access_token: "new-token-123",
        token_type: "Bearer",
        expires: expect.any(Number),
      }),
    )

    // Should set the Authorization header with the new token
    expect(mockRequest.headers.set).toHaveBeenCalledWith(
      "Authorization",
      "Bearer new-token-123",
    )
  })

  it("should not refresh expired token when autoRefresh is false", async () => {
    const interceptor = createAuthLocalStorageInterceptor({
      clientId: "test-client",
      autoRefresh: false,
    })

    // Mock existing token in localStorage
    const existingToken = {
      access_token: "expired-token-123",
      token_type: "Bearer",
      expires: Date.now() - 1000, // Expired token
    }

    vi.mocked(localStorage.getItem).mockReturnValueOnce(
      JSON.stringify(existingToken),
    )

    // Mock token expired check
    vi.mocked(tokenExpired).mockReturnValueOnce(true)

    await interceptor(mockRequest as any, mockOptions)

    // Should not refresh the token
    expect(createAnAccessToken).not.toHaveBeenCalled()

    // Should not store a new token
    expect(localStorage.setItem).not.toHaveBeenCalled()

    // Should still set the Authorization header with the expired token
    expect(mockRequest.headers.set).toHaveBeenCalledWith(
      "Authorization",
      "Bearer expired-token-123",
    )
  })

  it("should use valid existing token without refreshing", async () => {
    const interceptor = createAuthLocalStorageInterceptor({
      clientId: "test-client",
    })

    // Mock existing valid token in localStorage
    const existingToken = {
      access_token: "valid-token-123",
      token_type: "Bearer",
      expires: Date.now() + 3600000, // Valid token (1 hour in the future)
    }

    vi.mocked(localStorage.getItem).mockReturnValueOnce(
      JSON.stringify(existingToken),
    )

    // Mock token expired check
    vi.mocked(tokenExpired).mockReturnValueOnce(false)

    await interceptor(mockRequest as any, mockOptions)

    // Should not create a new token
    expect(createAnAccessToken).not.toHaveBeenCalled()

    // Should not store anything new
    expect(localStorage.setItem).not.toHaveBeenCalled()

    // Should set the Authorization header with existing token
    expect(mockRequest.headers.set).toHaveBeenCalledWith(
      "Authorization",
      "Bearer valid-token-123",
    )
  })

  it("should use custom storage key when provided", async () => {
    const customKey = "custom-storage-key"

    const interceptor = createAuthLocalStorageInterceptor({
      clientId: "test-client",
      storageKey: customKey,
    })

    vi.mocked(localStorage.getItem).mockReturnValueOnce("{}")

    await interceptor(mockRequest as any, mockOptions)

    // Should check the custom storage key
    expect(localStorage.getItem).toHaveBeenCalledWith(customKey)

    // Should store with the custom key and any string value
    expect(localStorage.setItem).toHaveBeenCalledWith(
      customKey,
      expect.any(String),
    )

    // Verify token structure in the saved token
    const setItemCall = vi.mocked(localStorage.setItem).mock.calls[0]
    const savedToken = JSON.parse(setItemCall[1])
    expect(savedToken).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
        token_type: expect.any(String),
      }),
    )
  })

  it("should throw error if clientId is missing", async () => {
    const interceptor = createAuthLocalStorageInterceptor({
      clientId: "",
      autoStoreCredentials: true,
    })

    vi.mocked(localStorage.getItem).mockReturnValueOnce("{}")

    await expect(interceptor(mockRequest as any, mockOptions)).rejects.toThrow(
      "Missing storefront client id",
    )
  })

  it("should throw error if token creation fails", async () => {
    const interceptor = createAuthLocalStorageInterceptor({
      clientId: "test-client",
      autoStoreCredentials: true,
    })

    vi.mocked(localStorage.getItem).mockReturnValueOnce("{}")

    // Mock token creation failure
    vi.mocked(createAnAccessToken).mockResolvedValueOnce({
      data: undefined,
      request: {} as any,
      response: {} as any,
      error: { message: "Failed to get access token" } as any,
    })

    await expect(interceptor(mockRequest as any, mockOptions)).rejects.toThrow(
      "Failed to get access token",
    )
  })
})

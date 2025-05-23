import { describe, it, expect, vi, beforeEach } from "vitest"
import { initializeCart } from "./initialize-cart"
import { createACart } from "../client"
import { CART_STORAGE_KEY } from "../constants/credentials"

// Mock the createACart function
vi.mock("../client", () => ({
  createACart: vi.fn(),
}))

describe("initializeCart", () => {
  const mockCartId = "mock-cart-id"
  const mockCartResponse = {
    data: {
      data: {
        id: mockCartId,
      },
    },
  }

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks()

    // Mock createACart to return a successful response
    vi.mocked(createACart).mockResolvedValue(mockCartResponse as any)
  })

  it("should return existing cartId from localStorage", async () => {
    // Setup localStorage with an existing cartId
    localStorage.setItem(CART_STORAGE_KEY, mockCartId)

    const result = await initializeCart()

    // Verify the function returns the existing cartId
    expect(result).toBe(mockCartId)

    // Verify createACart was not called
    expect(createACart).not.toHaveBeenCalled()
  })

  it("should create a new cart when cartId is not in localStorage", async () => {
    // Ensure localStorage is empty
    localStorage.clear()

    const result = await initializeCart()

    // Verify the function returns the new cartId
    expect(result).toBe(mockCartId)

    // Verify createACart was called with the correct parameters
    expect(createACart).toHaveBeenCalledTimes(1)
    expect(createACart).toHaveBeenCalledWith({
      body: {
        data: {
          name: "Storefront cart",
          description: "Standard cart created by the Storefront SDK",
        },
      },
    })

    // Verify the new cartId was stored in localStorage
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe(mockCartId)
  })

  it("should use custom storage key when provided", async () => {
    // Ensure localStorage is empty
    localStorage.clear()

    const customStorageKey = "custom-storage-key"

    const result = await initializeCart({ storageKey: customStorageKey })

    // Verify the function returns the new cartId
    expect(result).toBe(mockCartId)

    // Verify the new cartId was stored with the custom key
    expect(localStorage.getItem(customStorageKey)).toBe(mockCartId)
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull()
  })

  it("should throw an error when cart creation fails", async () => {
    // Ensure localStorage is empty
    localStorage.clear()

    // Mock createACart to return a failed response
    vi.mocked(createACart).mockResolvedValue({
      data: { data: null },
    } as any)

    // Verify the function throws an error
    await expect(initializeCart()).rejects.toThrow("Failed to create cart")

    // Verify localStorage was not updated
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull()
  })

  it("should throw an error when createACart API call fails", async () => {
    // Ensure localStorage is empty
    localStorage.clear()

    // Mock createACart to throw an error
    const error = new Error("API error")
    vi.mocked(createACart).mockRejectedValue(error)

    // Verify the function throws the same error
    await expect(initializeCart()).rejects.toThrow("API error")

    // Verify localStorage was not updated
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull()
  })
})

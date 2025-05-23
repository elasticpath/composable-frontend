import "@testing-library/jest-dom"
import { vi } from "vitest"

// Setup global localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    key: vi.fn((idx: number) => Object.keys(store)[idx] || null),
    length: 0,
  }
})()

beforeEach(() => {
  vi.resetAllMocks()
  // Setup localStorage mock
  Object.defineProperty(window, "localStorage", { value: localStorageMock })
  localStorageMock.clear()
})

// Make localStorage mock available globally for tests
vi.stubGlobal("localStorage", localStorageMock)

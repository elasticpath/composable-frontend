import { afterEach, describe, expect, it, vi } from "vitest"
import { DEFAULT_STORAGE_KEY, localStorageAdapter, memoryStorage } from "./storage"

function fakeLocalStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage
}

const globals = globalThis as Record<string, unknown>

afterEach(() => {
  delete globals.localStorage
  delete globals.addEventListener
  delete globals.removeEventListener
})

describe("memoryStorage", () => {
  it("round-trips a value and clears it", () => {
    const storage = memoryStorage()
    expect(storage.get()).toBeUndefined()
    storage.set("value")
    expect(storage.get()).toBe("value")
    storage.set(undefined)
    expect(storage.get()).toBeUndefined()
  })

  it("accepts an initial value", () => {
    expect(memoryStorage("seed").get()).toBe("seed")
  })

  it("notifies subscribers and stops after unsubscribe", () => {
    const storage = memoryStorage()
    const seen = vi.fn()
    const unsubscribe = storage.subscribe!(seen)
    storage.set("a")
    expect(seen).toHaveBeenCalledTimes(1)
    unsubscribe()
    storage.set("b")
    expect(seen).toHaveBeenCalledTimes(1)
  })
})

describe("localStorageAdapter", () => {
  it("reads and writes under the default key", () => {
    const store = fakeLocalStorage()
    globals.localStorage = store
    const adapter = localStorageAdapter()

    adapter.set("token")
    expect(store.getItem(DEFAULT_STORAGE_KEY)).toBe("token")
    expect(adapter.get()).toBe("token")

    adapter.set(undefined)
    expect(store.getItem(DEFAULT_STORAGE_KEY)).toBeNull()
    expect(adapter.get()).toBeUndefined()
  })

  it("honours a custom key", () => {
    const store = fakeLocalStorage()
    globals.localStorage = store
    localStorageAdapter("custom").set("token")
    expect(store.getItem("custom")).toBe("token")
  })

  it("is inert on a server, where there is no localStorage", () => {
    const adapter = localStorageAdapter()
    expect(() => adapter.set("token")).not.toThrow()
    expect(adapter.get()).toBeUndefined()
  })

  it("survives a localStorage that throws", () => {
    globals.localStorage = {
      getItem: () => {
        throw new Error("blocked")
      },
      setItem: () => {
        throw new Error("blocked")
      },
      removeItem: () => {
        throw new Error("blocked")
      },
    } as unknown as Storage

    const adapter = localStorageAdapter()
    expect(adapter.get()).toBeUndefined()
    expect(() => adapter.set("token")).not.toThrow()
  })

  it("notifies subscribers on a cross-tab storage event", () => {
    const listeners = new Map<string, (event: unknown) => void>()
    globals.localStorage = fakeLocalStorage()
    globals.addEventListener = (type: string, fn: (event: unknown) => void) =>
      void listeners.set(type, fn)
    globals.removeEventListener = (type: string) => void listeners.delete(type)

    const adapter = localStorageAdapter("shared")
    const seen = vi.fn()
    const unsubscribe = adapter.subscribe!(seen)

    listeners.get("storage")!({ key: "shared" })
    expect(seen).toHaveBeenCalledTimes(1)

    listeners.get("storage")!({ key: "something-else" })
    expect(seen).toHaveBeenCalledTimes(1)

    unsubscribe()
    expect(listeners.has("storage")).toBe(false)
  })
})

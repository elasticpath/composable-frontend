import { describe, it, expect, vi, beforeEach } from "vitest"
import { localStorageAdapter, cookieAdapter, memoryAdapter } from "./storage"

beforeEach(() => {
  vi.resetAllMocks()
})

describe("localStorageAdapter", () => {
  it("get/set/remove round-trips", () => {
    const a = localStorageAdapter("k")
    expect(a.get()).toBeUndefined()
    a.set("T")
    expect(a.get()).toBe("T")
    a.set(undefined)
    expect(a.get()).toBeUndefined()
  })

  it("subscribe triggers on storage event", () => {
    const a = localStorageAdapter("k2")
    const fn = vi.fn()
    const unsub = a.subscribe!(fn)
    localStorage.setItem("k2", "X")
    window.dispatchEvent(new StorageEvent("storage", { key: "k2" }))
    expect(fn).toHaveBeenCalledTimes(1)
    unsub()
  })
})

describe("cookieAdapter", () => {
  it("get/set/remove round-trips", () => {
    const a = cookieAdapter("cookie_k", { path: "/", sameSite: "Lax" })
    expect(a.get()).toBeUndefined()
    a.set("CT")
    expect(a.get()).toBe("CT")
    a.set(undefined)
    expect(a.get()).toBeUndefined()
  })
})

describe("memoryAdapter", () => {
  it("stores in memory and notifies subscribers", () => {
    const a = memoryAdapter()
    const fn = vi.fn()
    const unsub = a.subscribe!(fn)
    a.set("M")
    expect(a.get()).toBe("M")
    expect(fn).toHaveBeenCalledTimes(1)
    unsub()
  })
})

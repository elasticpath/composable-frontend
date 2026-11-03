import { beforeEach, vi } from "vitest"

const store = new Map<string, string>()

const memoryLocalStorage: Storage = {
  get length() {
    return store.size
  },
  clear: () => store.clear(),
  getItem: (key) => store.get(key) ?? null,
  key: (index) => [...store.keys()][index] ?? null,
  removeItem: (key) => {
    store.delete(key)
  },
  setItem: (key, value) => {
    store.set(key, String(value))
  },
}

vi.stubGlobal("localStorage", memoryLocalStorage)

beforeEach(() => {
  store.clear()
})

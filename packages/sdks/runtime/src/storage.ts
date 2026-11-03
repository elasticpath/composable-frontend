import type { StorageAdapter } from "./types"

export const DEFAULT_STORAGE_KEY = "epcc_auth_token"

export function memoryStorage(initial?: string): StorageAdapter {
  let value = initial
  const subscribers = new Set<() => void>()

  return {
    get: () => value,
    set(next) {
      value = next
      subscribers.forEach((fn) => fn())
    },
    subscribe(cb) {
      subscribers.add(cb)
      return () => {
        subscribers.delete(cb)
      }
    },
  }
}

export function localStorageAdapter(
  key: string = DEFAULT_STORAGE_KEY,
): StorageAdapter {
  const subscribers = new Set<() => void>()

  const available = (): Storage | undefined => {
    try {
      if (typeof globalThis === "undefined") return undefined
      const store = (globalThis as { localStorage?: Storage }).localStorage
      return store ?? undefined
    } catch {
      // Reading the property, not just using it, throws when cookies are blocked.
      return undefined
    }
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      subscribers.forEach((fn) => fn())
    }
  }

  return {
    get() {
      try {
        return available()?.getItem(key) ?? undefined
      } catch {
        return undefined
      }
    },
    set(value) {
      try {
        const store = available()
        if (!store) return
        if (value === undefined) store.removeItem(key)
        else store.setItem(key, value)
      } catch {
        // Quota or private-mode restriction. The token stays in memory.
      }
    },
    subscribe(cb) {
      subscribers.add(cb)
      const target = globalThis as unknown as {
        addEventListener?: typeof window.addEventListener
        removeEventListener?: typeof window.removeEventListener
      }
      target.addEventListener?.("storage", onStorage as EventListener)
      return () => {
        subscribers.delete(cb)
        if (subscribers.size === 0) {
          target.removeEventListener?.("storage", onStorage as EventListener)
        }
      }
    },
  }
}

import type { StorageAdapter } from "./types"

/** Default localStorage key. Matches nothing else in the SDKs on purpose. */
export const DEFAULT_STORAGE_KEY = "epcc_auth_token"

/**
 * In-memory storage. The default, and the right answer on a server: a token
 * held per process, never written to disk, gone on restart.
 */
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

/**
 * Browser localStorage with cross-tab sync via the `storage` event. Every
 * access is guarded, so importing this module on a server is safe; the adapter
 * simply reads and writes nothing there.
 */
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
      // Access itself throws when cookies are blocked.
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
        // Quota or a private-mode restriction. The token stays in memory.
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

import type { StorageAdapter } from "../types"
import { DEFAULT_LEGACY_STORAGE_KEY } from "../types"

export interface LegacyStorageBridgeOptions {
  /**
   * Storage key to use.
   * If name is provided, uses `${name}_ep_credentials` (matching old SDK).
   * Otherwise uses 'epCredentials' (old SDK default).
   */
  key?: string
  /**
   * Named gateway configuration (old SDK pattern).
   * If provided, key becomes `${name}_ep_credentials`.
   */
  name?: string
  /**
   * Storage backend to use.
   * - 'localStorage': Browser localStorage (default)
   * - 'cookie': JS-readable cookies
   * - 'memory': In-memory storage (for SSR/tests)
   */
  backend?: "localStorage" | "cookie" | "memory"
  /**
   * Cookie options (only used if backend is 'cookie')
   */
  cookie?: {
    path?: string
    domain?: string
    sameSite?: "Lax" | "Strict" | "None"
    secure?: boolean
    maxAge?: number
  }
}

/**
 * Resolve the storage key for old SDK compatibility.
 * Matches: ep-js-sdk/src/utils/helpers.js resolveCredentialsStorageKey
 */
function resolveStorageKey(options: LegacyStorageBridgeOptions): string {
  if (options.key) {
    return options.key
  }
  if (options.name) {
    return `${options.name}_ep_credentials`
  }
  return DEFAULT_LEGACY_STORAGE_KEY
}

/**
 * Create a localStorage-based storage adapter.
 * Includes cross-tab sync via 'storage' event.
 */
function createLocalStorageAdapter(key: string): StorageAdapter {
  const subscribers = new Set<() => void>()

  const onStorageEvent = (e: StorageEvent) => {
    if (e.key === key) {
      subscribers.forEach((fn) => fn())
    }
  }

  const safeGet = (): string | undefined => {
    try {
      if (typeof window === "undefined" || !("localStorage" in window)) {
        return undefined
      }
      return window.localStorage.getItem(key) ?? undefined
    } catch {
      return undefined
    }
  }

  const safeSet = (value?: string): void => {
    try {
      if (typeof window === "undefined" || !("localStorage" in window)) {
        return
      }
      if (!value) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, value)
      }
    } catch {
      // Storage may be disabled or full
    }
  }

  return {
    get: safeGet,
    set: safeSet,
    subscribe(cb) {
      subscribers.add(cb)
      if (typeof window !== "undefined") {
        window.addEventListener("storage", onStorageEvent)
      }
      return () => {
        subscribers.delete(cb)
        if (subscribers.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorageEvent)
        }
      }
    },
  }
}

/**
 * Create a cookie-based storage adapter.
 * Note: These are JS-readable cookies, not httpOnly.
 */
function createCookieAdapter(
  key: string,
  options: LegacyStorageBridgeOptions["cookie"] = {}
): StorageAdapter {
  const { path = "/", sameSite = "Lax", domain, secure, maxAge } = options

  const read = (): string | undefined => {
    if (typeof document === "undefined") return undefined
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith(key + "="))
    if (!raw) return undefined
    try {
      return decodeURIComponent(raw.split("=").slice(1).join("="))
    } catch {
      return raw.split("=").slice(1).join("=")
    }
  }

  const write = (value: string): void => {
    if (typeof document === "undefined") return
    let cookie = `${key}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`
    if (domain) cookie += `; Domain=${domain}`
    if (secure) cookie += `; Secure`
    if (maxAge) cookie += `; Max-Age=${maxAge}`
    document.cookie = cookie
  }

  const clear = (): void => {
    if (typeof document === "undefined") return
    document.cookie = `${key}=; Max-Age=0; Path=${path}`
  }

  return {
    get: read,
    set: (value) => (value ? write(value) : clear()),
    // No reliable cookie change event across tabs
  }
}

/**
 * Create an in-memory storage adapter.
 * Useful for SSR and testing.
 */
function createMemoryAdapter(initialValue?: string): StorageAdapter {
  let value = initialValue
  const subscribers = new Set<() => void>()

  return {
    get: () => value,
    set: (v) => {
      value = v
      subscribers.forEach((fn) => fn())
    },
    subscribe(cb) {
      subscribers.add(cb)
      return () => subscribers.delete(cb)
    },
  }
}

/**
 * Create a storage adapter that bridges to old SDK's storage location.
 *
 * This allows the new SDKs to read/write tokens from the same storage
 * location that the old SDK uses, enabling seamless token sharing.
 *
 * The storage key format matches the old SDK:
 * - Default: 'epCredentials'
 * - Named: '${name}_ep_credentials'
 */
export function createLegacyStorageBridge(
  options: LegacyStorageBridgeOptions = {}
): StorageAdapter {
  const key = resolveStorageKey(options)
  const backend = options.backend ?? "localStorage"

  switch (backend) {
    case "localStorage":
      return createLocalStorageAdapter(key)
    case "cookie":
      return createCookieAdapter(key, options.cookie)
    case "memory":
      return createMemoryAdapter()
    default:
      throw new Error(`Unknown storage backend: ${backend}`)
  }
}

/**
 * Storage adapter factories for direct use.
 */
export const storageAdapters = {
  localStorage: createLocalStorageAdapter,
  cookie: createCookieAdapter,
  memory: createMemoryAdapter,
}

import { CREDENTIALS_STORAGE_KEY } from "../constants/credentials"

export interface StorageAdapter {
  /** Return the current access token (string) or undefined if none. */
  get(): string | undefined
  /** Persist or remove the access token. */
  set(token?: string): void
  /** Optional: subscribe to external changes (e.g., other tabs). Returns an unsubscribe. */
  subscribe?(cb: () => void): () => void
}

/** Safe localStorage adapter with cross-tab sync (via 'storage' event). */
export function localStorageAdapter(
  key = CREDENTIALS_STORAGE_KEY,
): StorageAdapter {
  const subs = new Set<() => void>()

  const onStorage = (e: StorageEvent) => {
    if (e.key === key) subs.forEach((fn) => fn())
  }

  const safeGet = () => {
    try {
      if (typeof window === "undefined" || !("localStorage" in window))
        return undefined
      return window.localStorage.getItem(key) ?? undefined
    } catch {
      return undefined
    }
  }

  const safeSet = (t?: string) => {
    try {
      if (typeof window === "undefined" || !("localStorage" in window)) return
      if (!t) window.localStorage.removeItem(key)
      else window.localStorage.setItem(key, t)
    } catch {
      /* no-op */
    }
  }

  return {
    get: safeGet,
    set: safeSet,
    subscribe(cb) {
      subs.add(cb)
      if (typeof window !== "undefined") {
        window.addEventListener("storage", onStorage)
      }
      return () => {
        subs.delete(cb)
        if (!subs.size && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorage)
        }
      }
    },
  }
}

/** JS-readable cookie adapter (NOT httpOnly). For httpOnly cookies, keep access token here only. */
export function cookieAdapter(
  name = CREDENTIALS_STORAGE_KEY,
  attrs: Partial<{
    path: string
    domain: string
    sameSite: "Lax" | "Strict" | "None"
    secure: boolean
    maxAge: number // seconds
  }> = { path: "/", sameSite: "Lax" },
): StorageAdapter {
  const read = () => {
    if (typeof document === "undefined") return undefined
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith(name + "="))
    if (!raw) return undefined
    try {
      return decodeURIComponent(raw.split("=").slice(1).join("="))
    } catch {
      return raw.split("=").slice(1).join("=")
    }
  }

  const write = (v: string) => {
    if (typeof document === "undefined") return
    let s =
      `${name}=${encodeURIComponent(v)}; Path=${attrs.path ?? "/"}` +
      `; SameSite=${attrs.sameSite ?? "Lax"}`
    if (attrs.domain) s += `; Domain=${attrs.domain}`
    if (attrs.secure) s += `; Secure`
    if (attrs.maxAge) s += `; Max-Age=${attrs.maxAge}`
    document.cookie = s
  }

  const clear = () => {
    if (typeof document === "undefined") return
    document.cookie = `${name}=; Max-Age=0; Path=${attrs.path ?? "/"}`
  }

  return {
    get: read,
    set: (t) => (t ? write(t) : clear()),
    // No reliable cookie change event across tabs; omit subscribe
  }
}

/** In-memory adapter (useful for SSR/tests). */
export function memoryAdapter(initial?: string): StorageAdapter {
  let value = initial
  const subs = new Set<() => void>()
  return {
    get: () => value,
    set: (t) => {
      value = t
      subs.forEach((fn) => fn())
    },
    subscribe(cb) {
      subs.add(cb)
      return () => subs.delete(cb)
    },
  }
}

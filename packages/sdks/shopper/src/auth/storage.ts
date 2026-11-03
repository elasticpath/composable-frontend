import type { StorageAdapter } from "@epcc-sdk/sdks-runtime"
import { CREDENTIALS_STORAGE_KEY } from "../constants/credentials"

type CookieOptions = {
  name?: string
  path?: string
  domain?: string
  sameSite?: "Lax" | "Strict" | "None"
  secure?: boolean
  maxAge?: number
}

/** JS-readable cookie adapter (NOT httpOnly). For httpOnly cookies, keep access token here only. */
export function cookieAdapter(options: CookieOptions = {}): StorageAdapter {
  const { name = CREDENTIALS_STORAGE_KEY, ...attrs } = options
  const { path = "/", sameSite = "Lax" } = attrs
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
      `${name}=${encodeURIComponent(v)}; Path=${path}` +
      `; SameSite=${sameSite}`
    if (attrs.domain) s += `; Domain=${attrs.domain}`
    if (attrs.secure) s += `; Secure`
    if (attrs.maxAge) s += `; Max-Age=${attrs.maxAge}`
    document.cookie = s
  }

  const clear = () => {
    if (typeof document === "undefined") return
    document.cookie = `${name}=; Max-Age=0; Path=${path}`
  }

  return {
    get: read,
    set: (t) => (t ? write(t) : clear()),
  }
}

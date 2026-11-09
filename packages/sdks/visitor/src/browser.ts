import { VISITOR_COOKIE, VISITOR_COOKIE_LIFETIME_SECONDS } from "./constants"
import { clearedCookie, lastingCookie } from "./cookies"
import { isVisitorId, newVisitorId } from "./visitor-id"
import type { ConsentResult, Visitor } from "./types"

export type BrowserConsentFunction = () =>
  | ConsentResult
  | Promise<ConsentResult>

export type BrowserVisitorOptions = {
  consent: BrowserConsentFunction
  cookieName?: string
  lifetimeSeconds?: number
}

export function hasBrowserGlobalPrivacyControl(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl ===
      true
  )
}

function readDocumentCookie(name: string): string | undefined {
  for (const pair of document.cookie.split(";")) {
    const separator = pair.indexOf("=")
    if (separator === -1) continue
    if (pair.slice(0, separator).trim() === name) {
      return pair.slice(separator + 1).trim()
    }
  }
  return undefined
}

export function createBrowserVisitor(
  options: BrowserVisitorOptions,
): () => Promise<Visitor> {
  const cookieName = options.cookieName ?? VISITOR_COOKIE
  const lifetimeSeconds =
    options.lifetimeSeconds ?? VISITOR_COOKIE_LIFETIME_SECONDS
  let inMemoryId: string | undefined

  function clearLastingCookie() {
    if (readDocumentCookie(cookieName) !== undefined) {
      document.cookie = clearedCookie(cookieName, { httpOnly: false })
    }
  }

  function lastingId(): string {
    const existing = readDocumentCookie(cookieName)
    if (isVisitorId(existing)) return existing
    const id = newVisitorId()
    document.cookie = lastingCookie(cookieName, id, lifetimeSeconds)
    return id
  }

  return async function browserVisitor(): Promise<Visitor> {
    const result = await options.consent()

    if (result.state === "granted" && result.purposes.length > 0) {
      inMemoryId = undefined
      return {
        kind: "lasting",
        id: lastingId(),
        purposes: result.purposes,
      }
    }

    clearLastingCookie()

    if (result.state === "objected") {
      inMemoryId = undefined
      return { kind: "objected" }
    }

    inMemoryId ??= newVisitorId()
    return { kind: "session", id: inMemoryId }
  }
}

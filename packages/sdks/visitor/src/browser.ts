import { VISITOR_COOKIE, VISITOR_COOKIE_LIFETIME_SECONDS } from "./constants"
import { clearedCookie, findCookie, lastingCookie } from "./cookies"
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
  return findCookie(document.cookie, name)
}

export function createBrowserVisitor(
  options: BrowserVisitorOptions,
): () => Promise<Visitor> {
  const cookieName = options.cookieName ?? VISITOR_COOKIE
  const lifetimeSeconds =
    options.lifetimeSeconds ?? VISITOR_COOKIE_LIFETIME_SECONDS
  let inMemoryId: string | undefined
  let unpersistedLastingId: string | undefined

  function clearLastingCookie() {
    if (readDocumentCookie(cookieName) !== undefined) {
      document.cookie = clearedCookie(cookieName, { httpOnly: false })
    }
  }

  function lastingId(): string {
    const existing = readDocumentCookie(cookieName)
    if (isVisitorId(existing)) return existing
    if (unpersistedLastingId !== undefined) return unpersistedLastingId

    const id = newVisitorId()
    document.cookie = lastingCookie(cookieName, id, lifetimeSeconds)
    if (readDocumentCookie(cookieName) !== id) unpersistedLastingId = id
    return id
  }

  return async function browserVisitor(): Promise<Visitor> {
    if (typeof document === "undefined") return { kind: "none" }

    const result = await options.consent()

    if (result.state === "granted" && result.purposes.length > 0) {
      inMemoryId = undefined
      return {
        kind: "lasting",
        id: lastingId(),
        purposes: result.purposes,
      }
    }

    unpersistedLastingId = undefined
    clearLastingCookie()

    if (result.state === "objected") {
      inMemoryId = undefined
      return { kind: "objected" }
    }

    inMemoryId ??= newVisitorId()
    return { kind: "session", id: inMemoryId }
  }
}

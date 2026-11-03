import {
  SESSION_VISITOR_COOKIE,
  VISITOR_COOKIE,
  VISITOR_COOKIE_LIFETIME_SECONDS,
} from "./constants"
import {
  clearedCookie,
  lastingCookie,
  readCookie,
  sessionCookie,
} from "./cookies"
import type { ResolvedVisitor, ResolveVisitorOptions } from "./types"
import { isVisitorId, newVisitorId } from "./visitor-id"

export async function resolveVisitor(
  request: Request,
  options: ResolveVisitorOptions,
): Promise<ResolvedVisitor> {
  const consent = await options.consent(request)
  const cookieName = options.cookieName ?? VISITOR_COOKIE
  const sessionCookieName = options.sessionCookieName ?? SESSION_VISITOR_COOKIE

  const clearIfPresent = (name: string, httpOnly: boolean) =>
    readCookie(request, name) === undefined
      ? []
      : [clearedCookie(name, { httpOnly })]
  const clearLasting = () => clearIfPresent(cookieName, false)
  const clearSession = () => clearIfPresent(sessionCookieName, true)

  if (consent.state === "granted" && consent.purposes.length > 0) {
    const existing = readCookie(request, cookieName)
    if (isVisitorId(existing)) {
      return {
        visitor: { kind: "lasting", id: existing, purposes: consent.purposes },
        setCookies: clearSession(),
      }
    }

    const id = newVisitorId()
    return {
      visitor: { kind: "lasting", id, purposes: consent.purposes },
      setCookies: [
        lastingCookie(
          cookieName,
          id,
          options.lifetimeSeconds ?? VISITOR_COOKIE_LIFETIME_SECONDS,
        ),
        ...clearSession(),
      ],
    }
  }

  if (consent.state === "none" && consent.sessionId) {
    const existing = readCookie(request, sessionCookieName)
    if (isVisitorId(existing)) {
      return {
        visitor: { kind: "session", id: existing },
        setCookies: clearLasting(),
      }
    }

    const id = newVisitorId()
    return {
      visitor: { kind: "session", id },
      setCookies: [...clearLasting(), sessionCookie(sessionCookieName, id)],
    }
  }

  return {
    visitor:
      consent.state === "objected" ? { kind: "objected" } : { kind: "none" },
    setCookies: [...clearLasting(), ...clearSession()],
  }
}

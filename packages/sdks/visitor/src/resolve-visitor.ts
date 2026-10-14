import { VISITOR_COOKIE, VISITOR_COOKIE_LIFETIME_SECONDS } from "./constants"
import { lastingCookie, readCookie } from "./cookies"
import type { ResolvedVisitor, ResolveVisitorOptions } from "./types"
import { isVisitorId, newVisitorId } from "./visitor-id"

export async function resolveVisitor(
  request: Request,
  options: ResolveVisitorOptions,
): Promise<ResolvedVisitor> {
  const consent = await options.consent(request)
  const cookieName = options.cookieName ?? VISITOR_COOKIE

  if (consent.state === "granted") {
    const existing = readCookie(request, cookieName)
    if (isVisitorId(existing)) {
      return {
        visitor: { kind: "lasting", id: existing, purposes: consent.purposes },
        setCookies: [],
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
      ],
    }
  }

  return {
    visitor:
      consent.state === "objected" ? { kind: "objected" } : { kind: "none" },
    setCookies: [],
  }
}

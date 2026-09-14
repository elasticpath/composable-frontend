import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * The signed-in shopper's session.
 *
 * `saved-list.ts` scopes every read and write to an account id. That id has to
 * come from somewhere the browser cannot choose, or the scoping is decoration.
 *
 * A plain JSON cookie is not that place: it is whatever the browser sends, so a
 * shopper could edit one field and read another account's list. So the cookie
 * carries an HMAC over its payload, produced with a server-only secret, and the
 * server refuses any payload whose signature does not match. The id inside is
 * written once, at login, from Elastic Path's own response.
 *
 * These functions are deliberately pure and synchronous so the tamper cases can
 * be tested directly.
 */
export type ShopperSession = {
  accountId: string
  accountName: string
  email: string
  /** Seconds since the epoch. */
  expires: number
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

function signaturesMatch(expected: string, actual: string): boolean {
  const expectedBytes = Buffer.from(expected)
  const actualBytes = Buffer.from(actual)

  // timingSafeEqual throws on a length mismatch, which is itself a signal, so
  // check the length first and compare only equal-length buffers.
  if (expectedBytes.length !== actualBytes.length) {
    return false
  }

  return timingSafeEqual(expectedBytes, actualBytes)
}

/**
 * Serialises a session into the value stored in the cookie: the payload and its
 * signature, separated by a dot.
 */
export function createSessionCookieValue(
  session: ShopperSession,
  secret: string,
): string {
  if (!secret) {
    throw new Error("SESSION_SECRET is not set, refusing to issue a session")
  }

  const payload = Buffer.from(JSON.stringify(session)).toString("base64url")
  return `${payload}.${sign(payload, secret)}`
}

/**
 * Reads a cookie value back, or returns `null` if it was tampered with, signed
 * with a different secret, malformed, or has expired.
 *
 * `null` always means "treat this visitor as signed out". No caller needs to
 * know which of those it was.
 */
export function readSessionCookieValue(
  cookieValue: string | undefined,
  secret: string,
  now: number = Math.floor(Date.now() / 1000),
): ShopperSession | null {
  if (!cookieValue || !secret) {
    return null
  }

  const separator = cookieValue.lastIndexOf(".")
  if (separator <= 0) {
    return null
  }

  const payload = cookieValue.slice(0, separator)
  const signature = cookieValue.slice(separator + 1)

  if (!signaturesMatch(sign(payload, secret), signature)) {
    return null
  }

  let session: ShopperSession
  try {
    session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  } catch {
    return null
  }

  if (
    typeof session?.accountId !== "string" ||
    session.accountId.length === 0 ||
    typeof session.expires !== "number"
  ) {
    return null
  }

  if (session.expires <= now) {
    return null
  }

  return session
}

import { createHmac, timingSafeEqual } from "node:crypto"

export type ShopperSession = {
  accountId: string
  accountName: string
  email: string
  expires: number
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

function signaturesMatch(expected: string, actual: string): boolean {
  const expectedBytes = Buffer.from(expected)
  const actualBytes = Buffer.from(actual)

  if (expectedBytes.length !== actualBytes.length) {
    return false
  }

  return timingSafeEqual(expectedBytes, actualBytes)
}

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

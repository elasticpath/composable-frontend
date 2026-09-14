import { describe, expect, test } from "vitest"
import {
  createSessionCookieValue,
  readSessionCookieValue,
  type ShopperSession,
} from "./session"

const SECRET = "test-secret-not-used-anywhere-real"
const NOW = 1_700_000_000

const alice: ShopperSession = {
  accountId: "11111111-1111-1111-1111-111111111111",
  accountName: "Alice Ltd",
  email: "alice@example.com",
  expires: NOW + 3600,
}

describe("session cookie", () => {
  test("round-trips a session", () => {
    const cookie = createSessionCookieValue(alice, SECRET)

    expect(readSessionCookieValue(cookie, SECRET, NOW)).toEqual(alice)
  })

  test("rejects a payload edited to name another account", () => {
    const cookie = createSessionCookieValue(alice, SECRET)
    const [, signature] = cookie.split(".")
    const forgedPayload = Buffer.from(
      JSON.stringify({
        ...alice,
        accountId: "22222222-2222-2222-2222-222222222222",
      }),
    ).toString("base64url")

    const forged = `${forgedPayload}.${signature}`

    expect(readSessionCookieValue(forged, SECRET, NOW)).toBeNull()
  })

  test("rejects a cookie signed with a different secret", () => {
    const cookie = createSessionCookieValue(alice, "some-other-secret")

    expect(readSessionCookieValue(cookie, SECRET, NOW)).toBeNull()
  })

  test("rejects a cookie with no signature at all", () => {
    const payload = Buffer.from(JSON.stringify(alice)).toString("base64url")

    expect(readSessionCookieValue(payload, SECRET, NOW)).toBeNull()
  })

  test("rejects an expired session", () => {
    const cookie = createSessionCookieValue(alice, SECRET)

    expect(readSessionCookieValue(cookie, SECRET, alice.expires + 1)).toBeNull()
  })

  test("treats a missing cookie as signed out", () => {
    expect(readSessionCookieValue(undefined, SECRET, NOW)).toBeNull()
  })

  test("treats junk as signed out rather than throwing", () => {
    expect(readSessionCookieValue("not-a-cookie", SECRET, NOW)).toBeNull()
    expect(readSessionCookieValue("...", SECRET, NOW)).toBeNull()
  })

  test("will not issue a session without a secret", () => {
    expect(() => createSessionCookieValue(alice, "")).toThrow()
  })
})

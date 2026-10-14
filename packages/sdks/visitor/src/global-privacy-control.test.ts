import { describe, expect, it } from "vitest"
import { hasGlobalPrivacyControl } from "./global-privacy-control"
import { resolveVisitor } from "./resolve-visitor"

const requestWith = (headers: Record<string, string>) =>
  new Request("https://shop.example.test/", { headers })

describe("hasGlobalPrivacyControl", () => {
  it("is true when the browser sends Sec-GPC: 1", () => {
    expect(hasGlobalPrivacyControl(requestWith({ "Sec-GPC": "1" }))).toBe(true)
  })

  it("is false when the header is missing", () => {
    expect(hasGlobalPrivacyControl(requestWith({}))).toBe(false)
  })

  it.each([["0"], ["true"], [""], ["2"]])(
    "is false when Sec-GPC is %j",
    (value) => {
      expect(hasGlobalPrivacyControl(requestWith({ "Sec-GPC": value }))).toBe(
        false,
      )
    },
  )

  it("lets a consent function treat Global Privacy Control as an objection and clear the visitor cookies", async () => {
    const request = requestWith({
      "Sec-GPC": "1",
      cookie: "ep_vid=0123456789abcdef0123456789abcdef",
    })

    const { visitor, setCookies } = await resolveVisitor(request, {
      consent: (received) =>
        hasGlobalPrivacyControl(received)
          ? { state: "objected" }
          : { state: "none" },
    })

    expect(visitor).toEqual({ kind: "objected" })
    expect(setCookies).toEqual([
      "ep_vid=; Path=/; Max-Age=0; Secure; SameSite=Lax",
    ])
  })
})

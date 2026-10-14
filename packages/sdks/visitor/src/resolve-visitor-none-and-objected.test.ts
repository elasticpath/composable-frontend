import { describe, expect, it } from "vitest"
import { resolveVisitor } from "./resolve-visitor"

const validId = "0123456789abcdef0123456789abcdef"
const sessionId = "fedcba9876543210fedcba9876543210"

const clearedVid = "ep_vid=; Path=/; Max-Age=0; Secure; SameSite=Lax"
const clearedVsid =
  "ep_vsid=; Path=/; Max-Age=0; Secure; SameSite=Lax; HttpOnly"

const storefront = (cookie?: string) =>
  new Request("https://shop.example.test/products", {
    headers: cookie ? { cookie } : {},
  })

describe("resolveVisitor when the shopper has not decided and the merchant has not opted in", () => {
  it("returns no visitor and sets no cookie when there are no visitor cookies", async () => {
    const result = await resolveVisitor(storefront(), {
      consent: () => ({ state: "none" }),
    })

    expect(result).toEqual({ visitor: { kind: "none" }, setCookies: [] })
  })

  it("clears ep_vid and ep_vsid when either is present", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`ep_vid=${validId}; ep_vsid=${sessionId}`),
      { consent: () => ({ state: "none" }) },
    )

    expect(visitor).toEqual({ kind: "none" })
    expect(setCookies).toEqual([clearedVid, clearedVsid])
  })

  it("clears only the cookie that is present", async () => {
    const { setCookies } = await resolveVisitor(
      storefront(`ep_vsid=${sessionId}`),
      { consent: () => ({ state: "none", sessionId: false }) },
    )

    expect(setCookies).toEqual([clearedVsid])
  })
})

describe("resolveVisitor when the shopper objected", () => {
  it("returns an objected visitor and sets no cookie when there are no visitor cookies", async () => {
    const result = await resolveVisitor(storefront(), {
      consent: () => ({ state: "objected" }),
    })

    expect(result).toEqual({ visitor: { kind: "objected" }, setCookies: [] })
  })

  it("clears ep_vid and ep_vsid when either is present", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`ep_vid=${validId}; ep_vsid=${sessionId}`),
      { consent: () => ({ state: "objected" }) },
    )

    expect(visitor).toEqual({ kind: "objected" })
    expect(setCookies).toEqual([clearedVid, clearedVsid])
  })

  it("clears a malformed ep_vid as well", async () => {
    const { setCookies } = await resolveVisitor(storefront("ep_vid=junk"), {
      consent: () => ({ state: "objected" }),
    })

    expect(setCookies).toEqual([clearedVid])
  })

  it("makes a new id when the shopper consents again after the objection", async () => {
    const objection = await resolveVisitor(storefront(`ep_vid=${validId}`), {
      consent: () => ({ state: "objected" }),
    })
    expect(objection.setCookies).toEqual([clearedVid])

    const consentAgain = await resolveVisitor(storefront(), {
      consent: () => ({ state: "granted", purposes: ["analytics"] }),
    })

    expect(consentAgain.visitor).toMatchObject({ kind: "lasting" })
    expect((consentAgain.visitor as { id: string }).id).not.toBe(validId)
    expect(consentAgain.setCookies).toHaveLength(1)
  })

  it("clears cookies under the configured names", async () => {
    const { setCookies } = await resolveVisitor(
      storefront(`shop_visitor=${validId}; shop_session=${sessionId}`),
      {
        consent: () => ({ state: "objected" }),
        cookieName: "shop_visitor",
        sessionCookieName: "shop_session",
      },
    )

    expect(setCookies).toEqual([
      "shop_visitor=; Path=/; Max-Age=0; Secure; SameSite=Lax",
      "shop_session=; Path=/; Max-Age=0; Secure; SameSite=Lax; HttpOnly",
    ])
  })
})

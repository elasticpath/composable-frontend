import { describe, expect, it } from "vitest"
import { resolveVisitor } from "./resolve-visitor"
import type { ConsentResult } from "./types"

const grantAll: ConsentResult = {
  state: "granted",
  purposes: ["analytics", "personalization"],
}

const storefront = (cookie?: string) =>
  new Request("https://shop.example.test/products", {
    headers: cookie ? { cookie } : {},
  })

const validId = "0123456789abcdef0123456789abcdef"

describe("resolveVisitor when the shopper granted consent", () => {
  it("returns a lasting visitor with a new 128-bit hex id when no ep_vid cookie is present", async () => {
    const { visitor } = await resolveVisitor(storefront(), {
      consent: () => grantAll,
    })

    expect(visitor).toEqual({
      kind: "lasting",
      id: expect.stringMatching(/^[0-9a-f]{32}$/),
      purposes: ["analytics", "personalization"],
    })
  })

  it("sets ep_vid for 365 days as a Secure, SameSite=Lax cookie that browser code can read", async () => {
    const { visitor, setCookies } = await resolveVisitor(storefront(), {
      consent: () => grantAll,
    })

    expect(visitor).toMatchObject({ kind: "lasting" })
    expect(setCookies).toEqual([
      expect.stringMatching(
        /^ep_vid=[0-9a-f]{32}; Path=\/; Max-Age=31536000; Secure; SameSite=Lax$/,
      ),
    ])
    expect(setCookies[0]).toContain(`ep_vid=${(visitor as { id: string }).id};`)
  })

  it("makes a different id for each new visitor", async () => {
    const first = await resolveVisitor(storefront(), {
      consent: () => grantAll,
    })
    const second = await resolveVisitor(storefront(), {
      consent: () => grantAll,
    })

    expect(first.visitor).not.toEqual(second.visitor)
  })

  it("keeps the id of a valid ep_vid cookie and sets no cookie", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`theme=dark; ep_vid=${validId}; other=1`),
      { consent: () => grantAll },
    )

    expect(visitor).toEqual({
      kind: "lasting",
      id: validId,
      purposes: ["analytics", "personalization"],
    })
    expect(setCookies).toEqual([])
  })

  it.each([
    ["too short", "abc123"],
    ["upper case", validId.toUpperCase()],
    ["not hex", "z".repeat(32)],
    ["too long", `${validId}0`],
    ["empty", ""],
  ])("treats a %s ep_vid as absent and replaces it", async (_name, value) => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`ep_vid=${value}`),
      { consent: () => grantAll },
    )

    expect(visitor).toMatchObject({
      kind: "lasting",
      id: expect.stringMatching(/^[0-9a-f]{32}$/),
    })
    expect((visitor as { id: string }).id).not.toBe(value)
    expect(setCookies).toHaveLength(1)
  })

  it("sends only the purposes the consent function returns, read fresh on every request", async () => {
    const cookie = `ep_vid=${validId}`

    const analyticsOnly = await resolveVisitor(storefront(cookie), {
      consent: () => ({ state: "granted", purposes: ["analytics"] }),
    })
    const both = await resolveVisitor(storefront(cookie), {
      consent: () => grantAll,
    })

    expect(analyticsOnly.visitor).toEqual({
      kind: "lasting",
      id: validId,
      purposes: ["analytics"],
    })
    expect(both.visitor).toMatchObject({
      id: validId,
      purposes: ["analytics", "personalization"],
    })
  })

  it("passes the request to the consent function and waits for an async answer", async () => {
    const request = storefront("consent=yes")

    const { visitor } = await resolveVisitor(request, {
      consent: async (received) =>
        received === request
          ? { state: "granted", purposes: ["personalization"] }
          : { state: "objected" },
    })

    expect(visitor).toMatchObject({
      kind: "lasting",
      purposes: ["personalization"],
    })
  })

  it("uses a configured cookie name and lifetime", async () => {
    const { setCookies } = await resolveVisitor(storefront(), {
      consent: () => grantAll,
      cookieName: "shop_visitor",
      lifetimeSeconds: 60,
    })

    expect(setCookies).toEqual([
      expect.stringMatching(
        /^shop_visitor=[0-9a-f]{32}; Path=\/; Max-Age=60; Secure; SameSite=Lax$/,
      ),
    ])
  })

  it("reads a configured cookie name", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`shop_visitor=${validId}`),
      { consent: () => grantAll, cookieName: "shop_visitor" },
    )

    expect(visitor).toMatchObject({ id: validId })
    expect(setCookies).toEqual([])
  })
})

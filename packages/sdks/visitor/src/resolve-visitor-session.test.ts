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

const optedIn = () => ({ state: "none", sessionId: true }) as const

describe("resolveVisitor when the shopper has not decided and the merchant opted in to the session id", () => {
  it("returns a session visitor with a new 128-bit hex id when there is no ep_vsid cookie", async () => {
    const { visitor } = await resolveVisitor(storefront(), {
      consent: optedIn,
    })

    expect(visitor).toEqual({
      kind: "session",
      id: expect.stringMatching(/^[0-9a-f]{32}$/),
    })
  })

  it("sets ep_vsid as an HttpOnly, Secure, SameSite=Lax cookie that ends with the browser session", async () => {
    const { visitor, setCookies } = await resolveVisitor(storefront(), {
      consent: optedIn,
    })

    expect(setCookies).toEqual([
      `ep_vsid=${
        (visitor as { id: string }).id
      }; Path=/; Secure; SameSite=Lax; HttpOnly`,
    ])
    expect(setCookies[0]).not.toMatch(/Max-Age|Expires/i)
  })

  it("keeps a valid ep_vsid and sets no cookie, so Set-Cookie appears only on the first response", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`ep_vsid=${sessionId}`),
      { consent: optedIn },
    )

    expect(visitor).toEqual({ kind: "session", id: sessionId })
    expect(setCookies).toEqual([])
  })

  it.each([
    ["too short", "abc123"],
    ["upper case", sessionId.toUpperCase()],
    ["empty", ""],
  ])("treats a %s ep_vsid as absent and replaces it", async (_name, value) => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`ep_vsid=${value}`),
      { consent: optedIn },
    )

    expect(visitor).toMatchObject({
      kind: "session",
      id: expect.stringMatching(/^[0-9a-f]{32}$/),
    })
    expect(setCookies).toHaveLength(1)
  })

  it("clears ep_vid and never reuses it as the session id", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`ep_vid=${validId}`),
      { consent: optedIn },
    )

    expect(visitor).toMatchObject({ kind: "session" })
    expect((visitor as { id: string }).id).not.toBe(validId)
    expect(setCookies).toEqual([
      clearedVid,
      expect.stringMatching(/^ep_vsid=[0-9a-f]{32}; /),
    ])
  })

  it("uses a configured session cookie name", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`shop_session=${sessionId}`),
      { consent: optedIn, sessionCookieName: "shop_session" },
    )

    expect(visitor).toEqual({ kind: "session", id: sessionId })
    expect(setCookies).toEqual([])
  })
})

describe("resolveVisitor when the shopper moves from a session visitor to consent", () => {
  it("clears ep_vsid and links the new ep_vid to nothing", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`ep_vsid=${sessionId}`),
      { consent: () => ({ state: "granted", purposes: ["analytics"] }) },
    )

    expect(visitor).toMatchObject({
      kind: "lasting",
      purposes: ["analytics"],
    })
    expect((visitor as { id: string }).id).not.toBe(sessionId)
    expect(setCookies).toEqual([
      expect.stringMatching(/^ep_vid=[0-9a-f]{32}; /),
      clearedVsid,
    ])
    expect(setCookies[0]).not.toContain(sessionId)
  })

  it("clears ep_vsid when the shopper already has a valid ep_vid", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      storefront(`ep_vid=${validId}; ep_vsid=${sessionId}`),
      { consent: () => ({ state: "granted", purposes: ["analytics"] }) },
    )

    expect(visitor).toMatchObject({ kind: "lasting", id: validId })
    expect(setCookies).toEqual([clearedVsid])
  })
})

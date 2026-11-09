// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  createBrowserVisitor,
  createShopperClient,
  getByContextAllProducts,
  hasBrowserGlobalPrivacyControl,
} from "./index"
import type { ConsentResult } from "./index"
import { productListFromTheSpec } from "./test/fixtures"
import { json, stubFetch } from "./test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"
const idFormat = /^[0-9a-f]{32}$/

const auth = {
  clientId: "client-id",
  tokenProvider: async () => ({ access_token: "from-provider" }),
}

function storefront(consent: () => ConsentResult | Promise<ConsentResult>) {
  const { requests, transport } = stubFetch(() => json(productListFromTheSpec))
  const { client } = createShopperClient({ baseUrl, fetch: transport }, auth, {
    visitor: createBrowserVisitor({ consent }),
  })
  const search = () => getByContextAllProducts({ client })
  return { requests, search }
}

function clearCookies() {
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0].trim()
    if (name) {
      document.cookie = `${name}=; Path=/; Max-Age=0`
    }
  }
}

function visitorCookie(): string | undefined {
  return document.cookie
    .split(";")
    .map((pair) => pair.trim())
    .find((pair) => pair.startsWith("ep_vid="))
    ?.slice("ep_vid=".length)
}

const grantedAll: ConsentResult = {
  state: "granted",
  purposes: ["analytics", "personalization"],
}

describe("the browser visitor through createShopperClient", () => {
  beforeEach(clearCookies)
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe("without consent", () => {
    it("sends one in-memory id with consent none and sets no cookie", async () => {
      const { requests, search } = storefront(() => ({ state: "none" }))

      await search()
      await search()

      const ids = requests.map((r) => r.headers.get("EP-Visitor-Id"))
      expect(ids[0]).toMatch(idFormat)
      expect(ids[1]).toBe(ids[0])
      for (const request of requests) {
        expect(request.headers.get("EP-Visitor-Consent")).toBe("none")
      }
      expect(document.cookie).toBe("")
    })

    it("makes a new id when the page loads again", async () => {
      const first = storefront(() => ({ state: "none" }))
      await first.search()

      const afterReload = storefront(() => ({ state: "none" }))
      await afterReload.search()

      expect(afterReload.requests[0].headers.get("EP-Visitor-Id")).not.toBe(
        first.requests[0].headers.get("EP-Visitor-Id"),
      )
    })

    it("ignores the session id opt-in, which only applies to servers", async () => {
      const { requests, search } = storefront(() => ({
        state: "none",
        sessionId: true,
      }))

      await search()

      expect(requests[0].headers.get("EP-Visitor-Consent")).toBe("none")
      expect(document.cookie).toBe("")
    })

    it("clears a lasting cookie left from an earlier consent", async () => {
      document.cookie = "ep_vid=0123456789abcdef0123456789abcdef; Path=/"
      const { requests, search } = storefront(() => ({ state: "none" }))

      await search()

      expect(visitorCookie()).toBeUndefined()
      expect(requests[0].headers.get("EP-Visitor-Id")).not.toBe(
        "0123456789abcdef0123456789abcdef",
      )
    })

    it("treats granted with no purposes as no consent", async () => {
      const { requests, search } = storefront(() => ({
        state: "granted",
        purposes: [],
      }))

      await search()

      expect(requests[0].headers.get("EP-Visitor-Consent")).toBe("none")
      expect(document.cookie).toBe("")
    })
  })

  describe("with consent", () => {
    it("writes ep_vid with JavaScript and sends it with the purposes", async () => {
      const { requests, search } = storefront(() => grantedAll)

      await search()
      await search()

      const id = requests[0].headers.get("EP-Visitor-Id")
      expect(id).toMatch(idFormat)
      expect(visitorCookie()).toBe(id)
      expect(requests[1].headers.get("EP-Visitor-Id")).toBe(id)
      expect(requests[0].headers.get("EP-Visitor-Consent")).toBe(
        "analytics,personalization",
      )
    })

    it("reuses a valid ep_vid and writes nothing", async () => {
      const existing = "0123456789abcdef0123456789abcdef"
      document.cookie = `ep_vid=${existing}; Path=/`
      const written = vi.spyOn(document, "cookie", "set")
      const { requests, search } = storefront(() => grantedAll)

      await search()

      expect(requests[0].headers.get("EP-Visitor-Id")).toBe(existing)
      expect(written).not.toHaveBeenCalled()
    })

    it("replaces a malformed ep_vid", async () => {
      document.cookie = "ep_vid=not-an-id; Path=/"
      const { requests, search } = storefront(() => grantedAll)

      await search()

      const id = requests[0].headers.get("EP-Visitor-Id")
      expect(id).toMatch(idFormat)
      expect(visitorCookie()).toBe(id)
    })

    it("keeps the same id after a page load", async () => {
      const first = storefront(() => grantedAll)
      await first.search()

      const afterReload = storefront(() => grantedAll)
      await afterReload.search()

      expect(afterReload.requests[0].headers.get("EP-Visitor-Id")).toBe(
        first.requests[0].headers.get("EP-Visitor-Id"),
      )
    })

    it("writes the cookie the way the server does", async () => {
      const jar = vi.spyOn(document, "cookie", "set")
      const { search } = storefront(() => grantedAll)

      await search()

      expect(jar).toHaveBeenCalledTimes(1)
      expect(jar.mock.calls[0][0]).toMatch(
        /^ep_vid=[0-9a-f]{32}; Path=\/; Max-Age=31536000; Secure; SameSite=Lax$/,
      )
    })

    it("sends only the purposes the shopper agreed to, read fresh each call", async () => {
      let consent: ConsentResult = {
        state: "granted",
        purposes: ["analytics"],
      }
      const { requests, search } = storefront(() => consent)

      await search()
      consent = { state: "granted", purposes: ["personalization"] }
      await search()

      expect(requests.map((r) => r.headers.get("EP-Visitor-Consent"))).toEqual([
        "analytics",
        "personalization",
      ])
      expect(requests[1].headers.get("EP-Visitor-Id")).toBe(
        requests[0].headers.get("EP-Visitor-Id"),
      )
    })

    it("accepts a consent function that returns a promise", async () => {
      const { requests, search } = storefront(async () => grantedAll)

      await search()

      expect(requests[0].headers.get("EP-Visitor-Id")).toMatch(idFormat)
    })
  })

  describe("with an objection", () => {
    it("clears ep_vid and sends no visitor headers", async () => {
      let consent: ConsentResult = grantedAll
      const { requests, search } = storefront(() => consent)
      await search()
      expect(visitorCookie()).toBeDefined()

      consent = { state: "objected" }
      await search()

      expect(visitorCookie()).toBeUndefined()
      expect(requests[1].headers.has("EP-Visitor-Id")).toBe(false)
      expect(requests[1].headers.has("EP-Visitor-Consent")).toBe(false)
    })

    it("drops the in-memory id, so a later consent starts a new id", async () => {
      let consent: ConsentResult = { state: "none" }
      const { requests, search } = storefront(() => consent)
      await search()

      consent = { state: "objected" }
      await search()
      consent = { state: "none" }
      await search()

      expect(requests[2].headers.get("EP-Visitor-Id")).not.toBe(
        requests[0].headers.get("EP-Visitor-Id"),
      )
    })

    it("makes a new lasting id when consent returns after an objection", async () => {
      let consent: ConsentResult = grantedAll
      const { requests, search } = storefront(() => consent)
      await search()

      consent = { state: "objected" }
      await search()
      consent = grantedAll
      await search()

      expect(requests[2].headers.get("EP-Visitor-Id")).toMatch(idFormat)
      expect(requests[2].headers.get("EP-Visitor-Id")).not.toBe(
        requests[0].headers.get("EP-Visitor-Id"),
      )
    })
  })

  describe("moving between states", () => {
    it("never links the in-memory id to the lasting id", async () => {
      let consent: ConsentResult = { state: "none" }
      const { requests, search } = storefront(() => consent)
      await search()

      consent = grantedAll
      await search()

      expect(requests[1].headers.get("EP-Visitor-Id")).not.toBe(
        requests[0].headers.get("EP-Visitor-Id"),
      )
    })

    it("makes a fresh in-memory id after a withdrawal back to none", async () => {
      let consent: ConsentResult = grantedAll
      const { requests, search } = storefront(() => consent)
      await search()

      consent = { state: "none" }
      await search()

      expect(requests[1].headers.get("EP-Visitor-Id")).not.toBe(
        requests[0].headers.get("EP-Visitor-Id"),
      )
      expect(requests[1].headers.get("EP-Visitor-Consent")).toBe("none")
      expect(visitorCookie()).toBeUndefined()
    })
  })

  describe("cookie options", () => {
    it("uses the cookie name and lifetime the merchant sets", async () => {
      const { requests, transport } = stubFetch(() =>
        json(productListFromTheSpec),
      )
      const { client } = createShopperClient(
        { baseUrl, fetch: transport },
        auth,
        {
          visitor: createBrowserVisitor({
            consent: () => grantedAll,
            cookieName: "shop_vid",
            lifetimeSeconds: 60,
          }),
        },
      )
      const jar = vi.spyOn(document, "cookie", "set")

      await getByContextAllProducts({ client })

      expect(jar.mock.calls[0][0]).toMatch(
        /^shop_vid=[0-9a-f]{32}; Path=\/; Max-Age=60; /,
      )
      expect(requests[0].headers.get("EP-Visitor-Id")).toMatch(idFormat)
    })
  })

  describe("where the cookie does not persist", () => {
    beforeEach(() => {
      vi.spyOn(document, "cookie", "set").mockImplementation(() => {})
    })

    it("keeps one lasting id until the page loads again", async () => {
      const { requests, search } = storefront(() => grantedAll)

      await search()
      await search()

      const id = requests[0].headers.get("EP-Visitor-Id")
      expect(id).toMatch(idFormat)
      expect(requests[1].headers.get("EP-Visitor-Id")).toBe(id)
      expect(requests[0].headers.get("EP-Visitor-Consent")).toBe(
        "analytics,personalization",
      )
    })

    it("makes a new lasting id after an objection", async () => {
      let consent: ConsentResult = grantedAll
      const { requests, search } = storefront(() => consent)
      await search()

      consent = { state: "objected" }
      await search()
      consent = grantedAll
      await search()

      expect(requests[2].headers.get("EP-Visitor-Id")).not.toBe(
        requests[0].headers.get("EP-Visitor-Id"),
      )
    })

    it("makes a new lasting id after any state that is not granted", async () => {
      let consent: ConsentResult = grantedAll
      const { requests, search } = storefront(() => consent)
      await search()

      consent = { state: "none" }
      await search()
      consent = grantedAll
      await search()

      expect(requests[2].headers.get("EP-Visitor-Id")).not.toBe(
        requests[0].headers.get("EP-Visitor-Id"),
      )
      expect(requests[1].headers.get("EP-Visitor-Id")).not.toBe(
        requests[0].headers.get("EP-Visitor-Id"),
      )
    })

    it("keeps the lasting id apart from the in-memory id", async () => {
      let consent: ConsentResult = { state: "none" }
      const { requests, search } = storefront(() => consent)
      await search()

      consent = grantedAll
      await search()

      expect(requests[1].headers.get("EP-Visitor-Id")).not.toBe(
        requests[0].headers.get("EP-Visitor-Id"),
      )
    })
  })

  describe("where there is no document", () => {
    it.each<[string, ConsentResult]>([
      ["granted", grantedAll],
      ["none", { state: "none" }],
      ["objected", { state: "objected" }],
    ])(
      "sends no visitor headers and does not throw for %s",
      async (_, result) => {
        const { requests, search } = storefront(() => result)
        vi.stubGlobal("document", undefined)

        await search()

        expect(requests).toHaveLength(1)
        expect(requests[0].headers.has("EP-Visitor-Id")).toBe(false)
        expect(requests[0].headers.has("EP-Visitor-Consent")).toBe(false)
      },
    )
  })

  describe("creating a visitor source", () => {
    it("reads no DOM global until a visitor is asked for", () => {
      vi.stubGlobal("document", undefined)
      vi.stubGlobal("navigator", undefined)

      const visitor = createBrowserVisitor({
        consent: () => ({ state: "none" }),
      })

      expect(typeof visitor).toBe("function")
    })
  })
})

describe("hasBrowserGlobalPrivacyControl", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("is true when the browser sends the Global Privacy Control signal", () => {
    vi.stubGlobal("navigator", { globalPrivacyControl: true })

    expect(hasBrowserGlobalPrivacyControl()).toBe(true)
  })

  it("is false when the signal is false or absent", () => {
    vi.stubGlobal("navigator", { globalPrivacyControl: false })
    expect(hasBrowserGlobalPrivacyControl()).toBe(false)

    vi.stubGlobal("navigator", {})
    expect(hasBrowserGlobalPrivacyControl()).toBe(false)
  })

  it("is false where there is no navigator", () => {
    vi.stubGlobal("navigator", undefined)

    expect(hasBrowserGlobalPrivacyControl()).toBe(false)
  })

  it("lets a consent function treat the signal as an objection", async () => {
    vi.stubGlobal("navigator", { globalPrivacyControl: true })
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      {
        visitor: createBrowserVisitor({
          consent: () =>
            hasBrowserGlobalPrivacyControl()
              ? { state: "objected" }
              : { state: "granted", purposes: ["analytics"] },
        }),
      },
    )

    await getByContextAllProducts({ client })

    expect(requests[0].headers.has("EP-Visitor-Id")).toBe(false)
  })
})

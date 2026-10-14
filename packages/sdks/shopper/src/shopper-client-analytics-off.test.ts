import { describe, expect, it } from "vitest"
import type { Visitor } from "@epcc-sdk/visitor"
import { createShopperClient, getByContextAllProducts } from "./index"
import { productListFromTheSpec } from "./test/fixtures"
import { json, stubFetch } from "./test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"
const id = "0123456789abcdef0123456789abcdef"

const auth = {
  clientId: "client-id",
  tokenProvider: async () => ({ access_token: "from-provider" }),
}

const everyVisitorState: [string, Visitor][] = [
  ["a lasting visitor", { kind: "lasting", id, purposes: ["analytics"] }],
  ["a session visitor", { kind: "session", id }],
  ["the default visitor with no id", { kind: "none" }],
  ["an objecting visitor", { kind: "objected" }],
]

describe("createShopperClient with analyticsOff", () => {
  it.each(everyVisitorState)(
    "sends EP-Analytics: off on each call for %s",
    async (_, visitor) => {
      const { requests, transport } = stubFetch(() =>
        json(productListFromTheSpec),
      )
      const { client } = createShopperClient(
        { baseUrl, fetch: transport },
        auth,
        { visitor, analyticsOff: true },
      )

      await getByContextAllProducts({ client })
      await getByContextAllProducts({ client })

      expect(requests).toHaveLength(2)
      for (const request of requests) {
        expect(request.headers.get("EP-Analytics")).toBe("off")
      }
    },
  )

  it("keeps the visitor headers of a lasting visitor beside EP-Analytics: off", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      {
        visitor: { kind: "lasting", id, purposes: ["analytics"] },
        analyticsOff: true,
      },
    )

    await getByContextAllProducts({ client })

    expect(requests[0]!.headers.get("EP-Visitor-Id")).toBe(id)
    expect(requests[0]!.headers.get("EP-Visitor-Consent")).toBe("analytics")
  })

  it("sends EP-Analytics: off with no visitor option", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      { analyticsOff: true },
    )

    await getByContextAllProducts({ client })

    expect(requests[0]!.headers.get("EP-Analytics")).toBe("off")
    expect(requests[0]!.headers.get("EP-Visitor-Id")).toBeNull()
  })

  it("keeps EP-Analytics: off when the request is replayed after a 401", async () => {
    const { requests, transport } = stubFetch((_, seen) =>
      seen.length === 1
        ? json({ errors: [] }, 401)
        : json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      { analyticsOff: true },
    )

    await getByContextAllProducts({ client })

    expect(requests.map((r) => r.headers.get("EP-Analytics"))).toEqual([
      "off",
      "off",
    ])
  })
})

describe("createShopperClient without analyticsOff", () => {
  it.each(everyVisitorState)(
    "sends no EP-Analytics header for %s",
    async (_, visitor) => {
      const { requests, transport } = stubFetch(() =>
        json(productListFromTheSpec),
      )
      const { client } = createShopperClient(
        { baseUrl, fetch: transport },
        auth,
        { visitor },
      )

      await getByContextAllProducts({ client })

      expect(requests[0]!.headers.has("EP-Analytics")).toBe(false)
    },
  )

  it("sends no EP-Analytics header with no visitor option", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient({ baseUrl, fetch: transport }, auth)

    await getByContextAllProducts({ client })

    expect(requests[0]!.headers.has("EP-Analytics")).toBe(false)
  })

  it("sends no EP-Analytics header when analyticsOff is false", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      { analyticsOff: false },
    )

    await getByContextAllProducts({ client })

    expect(requests[0]!.headers.has("EP-Analytics")).toBe(false)
  })
})

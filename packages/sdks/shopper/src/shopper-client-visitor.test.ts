import { describe, expect, it } from "vitest"
import { createShopperClient, getByContextAllProducts } from "./index"
import { productListFromTheSpec } from "./test/fixtures"
import { json, stubFetch } from "./test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"
const id = "0123456789abcdef0123456789abcdef"

const auth = {
  clientId: "client-id",
  tokenProvider: async () => ({ access_token: "from-provider" }),
}

describe("createShopperClient with the visitor option", () => {
  it("sends the visitor id and the granted purposes on each call", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      {
        visitor: {
          kind: "lasting",
          id,
          purposes: ["analytics", "personalization"],
        },
      },
    )

    await getByContextAllProducts({ client })
    await getByContextAllProducts({ client })

    expect(requests).toHaveLength(2)
    for (const request of requests) {
      expect(request.headers.get("EP-Visitor-Id")).toBe(id)
      expect(request.headers.get("EP-Visitor-Consent")).toBe(
        "analytics,personalization",
      )
      expect(request.headers.get("Authorization")).toBe("Bearer from-provider")
    }
  })

  it("reads the visitor from a function on every call", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    let purposes: ("analytics" | "personalization")[] = ["analytics"]
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      { visitor: () => ({ kind: "lasting", id, purposes }) },
    )

    await getByContextAllProducts({ client })
    purposes = ["personalization"]
    await getByContextAllProducts({ client })

    expect(requests.map((r) => r.headers.get("EP-Visitor-Consent"))).toEqual([
      "analytics",
      "personalization",
    ])
  })

  it("keeps the visitor headers when the request is replayed after a 401", async () => {
    const { requests, transport } = stubFetch((_, seen) =>
      seen.length === 1
        ? json({ errors: [] }, 401)
        : json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      { visitor: { kind: "lasting", id, purposes: ["analytics"] } },
    )

    await getByContextAllProducts({ client })

    expect(requests).toHaveLength(2)
    expect(requests.map((r) => r.headers.get("EP-Visitor-Id"))).toEqual([
      id,
      id,
    ])
  })

  it("sends the session id with consent none on every call, so server renders and server actions share one id", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      { visitor: { kind: "session", id } },
    )

    await getByContextAllProducts({ client })
    await getByContextAllProducts({ client })

    expect(requests).toHaveLength(2)
    for (const request of requests) {
      expect(request.headers.get("EP-Visitor-Id")).toBe(id)
      expect(request.headers.get("EP-Visitor-Consent")).toBe("none")
      expect(request.headers.get("Authorization")).toBe("Bearer from-provider")
    }
  })

  it("stops sending visitor headers once the visitor function returns an objection", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const visitors = [{ kind: "session", id }, { kind: "objected" }] as const
    let calls = 0
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      auth,
      { visitor: () => visitors[calls++]! },
    )

    await getByContextAllProducts({ client })
    await getByContextAllProducts({ client })

    expect(requests[0]!.headers.get("EP-Visitor-Consent")).toBe("none")
    expect(requests[1]!.headers.get("EP-Visitor-Id")).toBeNull()
    expect(requests[1]!.headers.get("EP-Visitor-Consent")).toBeNull()
  })

  it.each([["none"], ["objected"]] as const)(
    "sends no visitor headers for a %s visitor",
    async (kind) => {
      const { requests, transport } = stubFetch(() =>
        json(productListFromTheSpec),
      )
      const { client } = createShopperClient(
        { baseUrl, fetch: transport },
        auth,
        { visitor: { kind } },
      )

      await getByContextAllProducts({ client })

      expect(requests[0]!.headers.get("EP-Visitor-Id")).toBeNull()
      expect(requests[0]!.headers.get("EP-Visitor-Consent")).toBeNull()
    },
  )
})

describe("createShopperClient without the visitor option", () => {
  it("sends no visitor headers and returns the same data as before", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient({ baseUrl, fetch: transport }, auth)

    const { data } = await getByContextAllProducts({ client })

    expect(requests[0]!.headers.get("EP-Visitor-Id")).toBeNull()
    expect(requests[0]!.headers.get("EP-Visitor-Consent")).toBeNull()
    expect(requests[0]!.headers.get("Authorization")).toBe(
      "Bearer from-provider",
    )
    expect(data).toEqual(productListFromTheSpec)
  })
})

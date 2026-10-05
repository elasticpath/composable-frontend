import { describe, expect, it } from "vitest"
import { createShopperClient, getByContextAllProducts } from "./index"
import { postMultiSearchOptions } from "./react-query"
import { zGetByContextAllProductsResponse } from "./zod"
import { productListFromTheSpec } from "./test/fixtures"
import { json, stubFetch } from "./test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"

describe("createShopperClient", () => {
  it("sends getByContextAllProducts to the configured base URL with the provider's bearer token", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      {
        clientId: "client-id",
        tokenProvider: async () => ({ access_token: "from-provider" }),
      },
    )

    const { data } = await getByContextAllProducts({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/catalog/products`)
    expect(requests[0]!.headers.get("Authorization")).toBe(
      "Bearer from-provider",
    )
    expect(data).toEqual(productListFromTheSpec)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch((_, seen) =>
      seen.length === 1
        ? json({ errors: [] }, 401)
        : json(productListFromTheSpec),
    )
    let minted = 0
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      {
        clientId: "client-id",
        tokenProvider: async () => {
          minted += 1
          return { access_token: `token-${minted}` }
        },
      },
    )

    const { data, response } = await getByContextAllProducts({ client })

    expect(requests.map((r) => r.headers.get("Authorization"))).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
    expect(response?.status).toBe(200)
    expect(data).toEqual(productListFromTheSpec)
  })
})

describe("the shared client", () => {
  it("sends an operation called without a client to EU West", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )

    await getByContextAllProducts({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/catalog/products",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the getByContextAllProducts response and rejects a field of the wrong type", () => {
    expect(
      zGetByContextAllProductsResponse.parse(productListFromTheSpec),
    ).toEqual(productListFromTheSpec)

    const [product] = productListFromTheSpec.data
    const tampered = {
      ...productListFromTheSpec,
      data: [{ ...product, attributes: { ...product!.attributes, name: 42 } }],
    }
    expect(zGetByContextAllProductsResponse.safeParse(tampered).success).toBe(
      false,
    )
  })

  it("coerces an int64 page total to a bigint", () => {
    const parsed = zGetByContextAllProductsResponse.parse({
      ...productListFromTheSpec,
      meta: { results: { total: 1 } },
    })

    expect(parsed.meta?.results?.total).toBe(1n)
  })
})

describe("the /react-query entry", () => {
  it("offers query options for postMultiSearch, a search sent as a POST", async () => {
    const { requests, transport } = stubFetch(() => json({ results: [] }))
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      {
        clientId: "client-id",
        tokenProvider: async () => ({ access_token: "from-provider" }),
      },
    )
    const options = postMultiSearchOptions({
      client,
      body: { searches: [{ q: "shirt" }] },
    })

    const data = await options.queryFn!({
      queryKey: options.queryKey,
      signal: new AbortController().signal,
      meta: undefined,
    } as never)

    expect(requests[0]!.method).toBe("POST")
    expect(requests[0]!.url).toBe(`${baseUrl}/pcm/catalog/multi-search`)
    expect(data).toEqual({ results: [] })
  })
})

import { describe, expect, it, vi } from "vitest"
import { createPxmClient, getAllProducts } from "./index"
import { zGetAllProductsResponse } from "./zod"

const listProductsExampleFromTheSpec = {
  data: [
    {
      type: "product",
      id: "9c85b276-09b4-488e-a59c-c561bae14c9e",
      attributes: {
        commodity_type: "physical",
        custom_inputs: {
          back: {
            name: "T-Shirt Back",
            validation_rules: [{ type: "string", options: { max_length: 50 } }],
            required: false,
          },
          front: {
            name: "T-Shirt Front",
            validation_rules: [{ type: "string", options: { max_length: 50 } }],
            required: false,
          },
        },
        description: "T-shirt.",
        mpn: "1234-5678-TTTT",
        name: "T-Shirt",
        sku: "97805",
        slug: "97805",
        status: "live",
        upc_ean: "12345656",
        tags: ["tag1", "tag2"],
        extensions: {
          "products(size)": {
            widthMM: 600,
            fuelType: "electric",
            hasUKPlug: true,
            online: null,
          },
        },
      },
      relationships: {
        children: {
          data: [],
          links: {
            self: "/products/9c85b276-09b4-488e-a59c-c561bae14c9e/children",
          },
        },
        component_products: {
          data: [],
          links: {
            self: "/products/9c85b276-09b4-488e-a59c-c561bae14c9e/relationships/component_products",
          },
        },
        files: {
          data: [],
          links: {
            self: "/products/9c85b276-09b4-488e-a59c-c561bae14c9e/relationships/files",
          },
        },
        main_image: { data: null },
        templates: {
          data: [],
          links: {
            self: "/products/9c85b276-09b4-488e-a59c-c561bae14c9e/relationships/templates",
          },
        },
        variations: {
          data: [],
          links: {
            self: "/products/9c85b276-09b4-488e-a59c-c561bae14c9e/relationships/variations",
          },
        },
      },
      meta: {
        created_at: "2022-08-18T14:25:57.391Z",
        owner: "store",
        product_types: ["standard"],
        updated_at: "2022-08-18T14:25:57.391Z",
      },
    },
  ],
  meta: { results: { total: 1 } },
}

const baseUrl = "https://useast.api.elasticpath.com"

function stubFetch(...statuses: number[]) {
  const requests: Request[] = []
  const transport = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const request =
        input instanceof Request && init === undefined
          ? input
          : new Request(input, init)
      requests.push(request)
      const status =
        statuses[Math.min(requests.length - 1, statuses.length - 1)]!
      return new Response(
        status === 200 ? JSON.stringify(listProductsExampleFromTheSpec) : "{}",
        {
          status,
          headers: { "Content-Type": "application/json" },
        },
      )
    },
  ) as unknown as typeof fetch
  return { requests, transport }
}

describe("createPxmClient", () => {
  it("sends getAllProducts to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createPxmClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await getAllProducts({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/pcm/products`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(listProductsExampleFromTheSpec)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createPxmClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await getAllProducts({ client })

    expect(requests.map((r) => r.headers.get("Authorization"))).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
    expect(response?.status).toBe(200)
    expect(data).toEqual(listProductsExampleFromTheSpec)
  })
})

describe("the shared client", () => {
  it("sends an operation called without a client to EU West", async () => {
    const { requests, transport } = stubFetch(200)

    await getAllProducts({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/pcm/products",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the getAllProducts response and rejects a field of the wrong type", () => {
    expect(
      zGetAllProductsResponse.parse(listProductsExampleFromTheSpec),
    ).toEqual(listProductsExampleFromTheSpec)

    const [product] = listProductsExampleFromTheSpec.data
    const tampered = {
      ...listProductsExampleFromTheSpec,
      data: [{ ...product, attributes: { ...product!.attributes, name: 42 } }],
    }
    expect(zGetAllProductsResponse.safeParse(tampered).success).toBe(false)
  })

  it("rejects a date-time field given a number", () => {
    const [product] = listProductsExampleFromTheSpec.data
    const tampered = {
      ...listProductsExampleFromTheSpec,
      data: [
        { ...product, meta: { ...product!.meta, created_at: 1660832757391 } },
      ],
    }
    expect(zGetAllProductsResponse.safeParse(tampered).success).toBe(false)
  })
})

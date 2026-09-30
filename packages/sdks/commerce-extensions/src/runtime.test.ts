import { describe, expect, it, vi } from "vitest"
import { createCommerceExtensionsClient, listCustomApis } from "./index"
import { zListCustomApisResponse } from "./zod"

// Built from the property examples in the spec's schemas; the operation has no response example.
const fixture = {
  data: [
    {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      type: "custom_api",
      name: "Wishlists",
      description: "Specifies the description for this Custom API.",
      slug: "wishlists",
      api_type: "wishlist_ext",
      allow_upserts: false,
      meta: {
        timestamps: {
          updated_at: "2017-01-10T11:41:19.244Z",
          created_at: "2017-01-10T11:41:19.244Z",
        },
      },
      relationships: {
        parent_apis: {
          data: [
            { type: "custom_api", id: "652e39d8-d613-493e-8c20-fef99ad6327a" },
          ],
        },
      },
    },
  ],
  meta: {
    results: { total: 1 },
    page: { limit: 100, offset: 0, current: 1, total: 1 },
  },
  links: { current: null, first: null, last: null, next: null, prev: null },
}

const baseUrl = "https://useast.api.elasticpath.com"

/** Answers with each status in turn, and records every request it was handed. */
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
      return new Response(status === 200 ? JSON.stringify(fixture) : "{}", {
        status,
        headers: { "Content-Type": "application/json" },
      })
    },
  ) as unknown as typeof fetch
  return { requests, transport }
}

describe("createCommerceExtensionsClient", () => {
  it("sends listCustomApis to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createCommerceExtensionsClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await listCustomApis({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(
      `${baseUrl}/v2/settings/extensions/custom-apis`,
    )
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createCommerceExtensionsClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await listCustomApis({ client })

    expect(requests.map((r) => r.headers.get("Authorization"))).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
    expect(response?.status).toBe(200)
    expect(data).toEqual(fixture)
  })
})

describe("the shared client", () => {
  it("sends an operation called without a client to EU West", async () => {
    const { requests, transport } = stubFetch(200)

    await listCustomApis({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/settings/extensions/custom-apis",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the listCustomApis response and rejects a field of the wrong type", () => {
    expect(zListCustomApisResponse.parse(fixture)).toEqual(fixture)

    const [api] = fixture.data
    const tampered = { ...fixture, data: [{ ...api, allow_upserts: "false" }] }
    expect(zListCustomApisResponse.safeParse(tampered).success).toBe(false)
  })
})

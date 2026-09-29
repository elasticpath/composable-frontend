import { describe, expect, it, vi } from "vitest"
import { createInventoriesClient, listStock } from "./index"
import { zListStockResponse } from "./zod"

// Built from the property examples in the spec's schemas; the operation has no response example.
const fixture = {
  data: [
    {
      id: "00000000-0000-0000-0000-000000000000",
      type: "stock",
      attributes: {
        available: 20,
        allocated: 10,
        total: 30,
        locations: {},
      },
      meta: {
        stock_id: "00000000-0000-0000-0000-000000000000",
        timestamps: {
          updated_at: "2017-01-10T11:41:19.244842Z",
          created_at: "2017-01-10T11:41:19.244842Z",
        },
      },
    },
  ],
  links: {},
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
      if (new URL(request.url).pathname === "/oauth/access_token") {
        return new Response(JSON.stringify({ access_token: "minted" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
      const sent = requests.filter(
        (r) => new URL(r.url).pathname !== "/oauth/access_token",
      ).length
      const status = statuses[Math.min(sent - 1, statuses.length - 1)]!
      return new Response(status === 200 ? JSON.stringify(fixture) : "{}", {
        status,
        headers: { "Content-Type": "application/json" },
      })
    },
  ) as unknown as typeof fetch
  return { requests, transport }
}

describe("createInventoriesClient", () => {
  it("sends listStock under /v2 at the configured host with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createInventoriesClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await listStock({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/inventories`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createInventoriesClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await listStock({ client })

    expect(requests.map((r) => r.headers.get("Authorization"))).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
    expect(response?.status).toBe(200)
    expect(data).toEqual(fixture)
  })

  it.each([baseUrl, `${baseUrl}/v2`, `${baseUrl}/`])(
    "given %s, mints the token at the host root and sends listStock under /v2",
    async (given) => {
      const { requests, transport } = stubFetch(200)
      const client = createInventoriesClient({
        baseUrl: given,
        clientId: "id",
        clientSecret: "secret",
        fetch: transport,
      })

      await listStock({ client })

      expect(requests.map((r) => r.url)).toEqual([
        `${baseUrl}/oauth/access_token`,
        `${baseUrl}/v2/inventories`,
      ])
    },
  )
})

describe("the shared client", () => {
  it("sends an operation called without a client to EU West under /v2", async () => {
    const { requests, transport } = stubFetch(200)

    await listStock({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/inventories",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the listStock response and rejects a field of the wrong type", () => {
    // The int64 stock quantities parse to bigint, not number.
    expect(
      zListStockResponse.parse(fixture).data[0]!.attributes.available,
    ).toBe(BigInt(20))

    const [stock] = fixture.data
    const tampered = {
      ...fixture,
      data: [
        {
          ...stock,
          meta: { ...stock!.meta, timestamps: { created_at: 20170110 } },
        },
      ],
    }
    expect(zListStockResponse.safeParse(tampered).success).toBe(false)
  })
})

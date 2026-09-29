import { describe, expect, it, vi } from "vitest"
import { createFlowsClient, getAllFlows } from "./index"
import { zGetAllFlowsResponse } from "./zod"

// The spec's default example for getAllFlows.
const fixture = {
  data: [
    {
      id: "6d320b42-237d-4474-8452-d49f884d4ae1",
      type: "flow",
      name: "Products-1",
      slug: "products-1",
      description: "Extends the default product object",
      enabled: true,
      links: {
        self: "https://useast.api.elasticpath.com/v2/flows/6d320b42-237d-4474-8452-d49f884d4ae1",
      },
      relationships: {},
      meta: {
        owner: "organization",
        timestamps: {
          created_at: "2018-05-10T18:04:26.623Z",
          updated_at: "2018-05-10T18:04:26.623Z",
        },
      },
    },
  ],
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

describe("createFlowsClient", () => {
  it("sends getAllFlows to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createFlowsClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await getAllFlows({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/flows`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createFlowsClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await getAllFlows({ client })

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

    await getAllFlows({ fetch: transport })

    expect(requests[0]!.url).toBe("https://euwest.api.elasticpath.com/v2/flows")
  })
})

describe("the /zod entry", () => {
  it("parses the getAllFlows response and rejects a field of the wrong type", () => {
    expect(zGetAllFlowsResponse.parse(fixture)).toEqual(fixture)

    const [flow] = fixture.data
    const tampered = { ...fixture, data: [{ ...flow, enabled: "true" }] }
    expect(zGetAllFlowsResponse.safeParse(tampered).success).toBe(false)
  })
})

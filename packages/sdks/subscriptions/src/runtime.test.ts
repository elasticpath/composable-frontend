import { describe, expect, it, vi } from "vitest"
import { createSubscriptionsClient, listOfferings } from "./index"
import { zListOfferingsResponse } from "./zod"

// Built from the property examples in the spec's schemas; the operation has no response example.
const fixture = {
  data: [
    {
      id: "00000000-0000-0000-0000-000000000000",
      type: "subscription_offering",
      attributes: {
        name: "Magazine",
        description: "A lovely magazine that is published every month.",
        updated_at: "2017-01-10T11:41:19.244842Z",
        created_at: "2017-01-10T11:41:19.244842Z",
      },
      meta: {
        external_plan_refs: [],
        owner: "store",
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

describe("createSubscriptionsClient", () => {
  it("sends listOfferings to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createSubscriptionsClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await listOfferings({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/subscriptions/offerings`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createSubscriptionsClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await listOfferings({ client })

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

    await listOfferings({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/subscriptions/offerings",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the listOfferings response and rejects a field of the wrong type", () => {
    expect(zListOfferingsResponse.parse(fixture)).toEqual(fixture)

    const [offering] = fixture.data
    const tampered = {
      ...fixture,
      data: [
        { ...offering, attributes: { ...offering!.attributes, name: 42 } },
      ],
    }
    expect(zListOfferingsResponse.safeParse(tampered).success).toBe(false)
  })
})

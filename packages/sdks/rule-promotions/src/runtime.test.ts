import { describe, expect, it, vi } from "vitest"
import { createRulePromotionsClient, getRulePromotions } from "./index"
import { zGetRulePromotionsResponse } from "./zod"

// The spec's FreeShippingForCartOver100 create example as the service returns it: with an id,
// timestamps, and start and end as date-times. The operation has no response example.
const fixture = {
  data: [
    {
      type: "rule_promotion",
      id: "00000000-0000-0000-0000-000000000000",
      name: "Free FedEx Ground shipping when cart is $100 or more",
      description: "Free FedEx Ground shipping when cart is $100 or more.",
      enabled: true,
      automatic: false,
      start: "2024-08-01T00:00:00Z",
      end: "2050-12-31T00:00:00Z",
      rule_set: {
        rules: { strategy: "cart_total", operator: "gte", args: [10000] },
        actions: [
          {
            strategy: "shipping_discount",
            args: ["percent", 100],
            condition: {
              strategy: "shipping_type",
              operator: "in",
              args: ["fedex_ground"],
            },
          },
        ],
      },
      meta: {
        timestamps: {
          created_at: "2024-08-01T00:00:00Z",
          updated_at: "2024-08-01T00:00:00Z",
        },
      },
    },
  ],
  links: {},
  meta: {
    page: { current: 1, limit: 25, offset: 0, total: 1 },
    results: { total: 1 },
  },
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

describe("createRulePromotionsClient", () => {
  it("sends getRulePromotions to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createRulePromotionsClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await getRulePromotions({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/rule-promotions`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createRulePromotionsClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await getRulePromotions({ client })

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

    await getRulePromotions({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/rule-promotions",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the getRulePromotions response and rejects a field of the wrong type", () => {
    expect(zGetRulePromotionsResponse.parse(fixture)).toEqual(fixture)

    const [promotion] = fixture.data
    const tampered = { ...fixture, data: [{ ...promotion, enabled: "true" }] }
    expect(zGetRulePromotionsResponse.safeParse(tampered).success).toBe(false)
  })
})

import { describe, expect, it, vi } from "vitest"
import { createPromotionsStandardClient, getAllPromotions } from "./index"
import {
  zGetAllPromotionsResponse,
  zPostV2PromotionsByPromotionIdJobsBody,
} from "./zod"

// Built from the property examples in the spec's schemas; the operation has no response example.
const fixture = {
  data: [
    {
      type: "promotion",
      id: "00000000-0000-0000-0000-000000000000",
      name: "Buy SKU1 and SKU2 to get free gift",
      description: "SKU1 and SKU2 for free gift",
      promotion_type: "fixed_discount",
      enabled: true,
      automatic: true,
      start: "2020-01-01",
      end: "2100-01-01",
      max_applications_per_cart: 0,
      schema: { currencies: [{ amount: 1000, currency: "USD" }] },
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

describe("createPromotionsStandardClient", () => {
  it("sends getAllPromotions to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createPromotionsStandardClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await getAllPromotions({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/promotions`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createPromotionsStandardClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await getAllPromotions({ client })

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

    await getAllPromotions({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/promotions",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the getAllPromotions response and rejects a field of the wrong type", () => {
    expect(zGetAllPromotionsResponse.parse(fixture)).toEqual(fixture)

    const [promotion] = fixture.data
    const tampered = { ...fixture, data: [{ ...promotion, enabled: "true" }] }
    expect(zGetAllPromotionsResponse.safeParse(tampered).success).toBe(false)
  })

  // The override points the job create body at a { data } wrapper and leaves the spec's bare
  // body beside the $ref. A generator that read the sibling would drop the wrapper silently.
  it("wraps the job create body in data, as the service requires", () => {
    const job = {
      type: "promotion_job",
      job_type: "code_generate" as const,
      parameters: { number_of_codes: 1 },
    }

    expect(
      zPostV2PromotionsByPromotionIdJobsBody.safeParse({ data: job }).success,
    ).toBe(true)
    expect(zPostV2PromotionsByPromotionIdJobsBody.safeParse(job).success).toBe(
      false,
    )
  })
})

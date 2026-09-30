import { describe, expect, it, vi } from "vitest"
import { createSettingsClient, getV2Settings } from "./index"
import { zGetV2SettingsResponse } from "./zod"

// Built from the property examples in the spec's schemas; the operation has no response example.
const fixture = {
  data: {
    type: "settings",
    page_length: 25,
    list_child_products: false,
    additional_languages: ["es", "fr", "de"],
    calculation_method: "line",
    address_mandatory_fields: [
      "first_name",
      "last_name",
      "line_1",
      "city",
      "region",
      "postcode",
      "country",
      "instructions",
    ],
    shopper_address_limit: 25,
    id: "61daaa08-9z05-4497-b9ca-626cd0f9932b",
    include_organization_resources: false,
    cart_item_limit: 100,
    custom_discount_limit: 5,
    currency_limit: 10,
    field_limit: 100,
    integration_limit: 100,
    event_limit: 5,
    filter_limit: 10,
    tax_item_limit: 5,
    promotions_limit: 1000,
    promotion_codes_limit: 1000,
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

describe("createSettingsClient", () => {
  it("sends getV2Settings to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createSettingsClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await getV2Settings({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/settings`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createSettingsClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await getV2Settings({ client })

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

    await getV2Settings({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/settings",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the getV2Settings response and rejects a field of the wrong type", () => {
    expect(zGetV2SettingsResponse.parse(fixture)).toEqual(fixture)

    const tampered = {
      ...fixture,
      data: { ...fixture.data, page_length: "25" },
    }
    expect(zGetV2SettingsResponse.safeParse(tampered).success).toBe(false)
  })
})

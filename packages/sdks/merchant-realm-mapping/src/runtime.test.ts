import { describe, expect, it, vi } from "vitest"
import {
  createMerchantRealmMappingClient,
  getMerchantRealmMappings,
} from "./index"
import { zGetMerchantRealmMappingsResponse } from "./zod"

// Built from the property examples in the spec's schemas; the operation has no response example.
const fixture = {
  data: {
    id: "0c45e4ec-26e0-4043-86e4-c15b9cf985a0",
    prefix: "myCompany",
    type: "merchant-realm-mappings",
    realm_id: "e730bf37-ed95-4ca9-b4c4-2c5ee08b21d7",
    store_id: "88888888-4444-4333-8333-111111111111",
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

describe("createMerchantRealmMappingClient", () => {
  it("sends getMerchantRealmMappings to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createMerchantRealmMappingClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await getMerchantRealmMappings({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/merchant-realm-mappings`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createMerchantRealmMappingClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await getMerchantRealmMappings({ client })

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

    await getMerchantRealmMappings({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/merchant-realm-mappings",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the getMerchantRealmMappings response and rejects a field of the wrong type", () => {
    expect(zGetMerchantRealmMappingsResponse.parse(fixture)).toEqual(fixture)

    const tampered = { ...fixture, data: { ...fixture.data, prefix: 42 } }
    expect(zGetMerchantRealmMappingsResponse.safeParse(tampered).success).toBe(
      false,
    )
  })
})

import { describe, expect, it, vi } from "vitest"
import { createApplicationKeysClient, listApplicationKeys } from "./index"
import { zListApplicationKeysResponse } from "./zod"

// Built from the property examples in the spec's schemas; the operation has no response example.
const fixture = {
  data: [
    {
      id: "5a2c6a1e-4b1a-4f0c-9d55-3f1d5b7c9e21",
      type: "application_key",
      name: "Storefront key",
      reserved_rate_limit: 10,
      client_id: "Z2dDp1f1Tg30p2C6ZVit7W1AKUtVhMVSTAPOIK4adA",
      meta: {
        timestamps: {
          created_at: "2017-01-10T11:41:19.244Z",
          updated_at: "2017-01-10T11:41:19.244Z",
          last_used_at: "2017-01-10T11:41:19.244Z",
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

describe("createApplicationKeysClient", () => {
  it("sends listApplicationKeys to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createApplicationKeysClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await listApplicationKeys({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/application-keys`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createApplicationKeysClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await listApplicationKeys({ client })

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

    await listApplicationKeys({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/application-keys",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the listApplicationKeys response and rejects a field of the wrong type", () => {
    expect(zListApplicationKeysResponse.parse(fixture)).toEqual(fixture)

    const [key] = fixture.data
    const tampered = {
      ...fixture,
      data: [{ ...key, reserved_rate_limit: "10" }],
    }
    expect(zListApplicationKeysResponse.safeParse(tampered).success).toBe(false)
  })
})

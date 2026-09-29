import { describe, expect, it, vi } from "vitest"
import { createPermissionsClient, listStandardUserRoles } from "./index"
import { zListStandardUserRolesResponse } from "./zod"

// Built from the property examples in the spec's schemas; the operation has no response example.
const fixture = {
  data: [
    {
      id: "8f7c9b2e-1d34-4a6f-b0c2-5e9a7d3f1b44",
      type: "standard_user_role",
      name: "Store Admin",
      access_levels: {
        accounts: "none",
        application_keys: "none",
        authentication: "none",
        catalog_releases: "none",
        catalogs: "none",
        composer: "none",
        currencies: "none",
        custom_apis: "none",
        flows: "none",
        legacy_catalogs: "none",
        metrics: "none",
        orders: "none",
        payment_gateways: "none",
        personal_data: "none",
        price_books: "none",
        products: "none",
        promotions: "none",
        settings: "none",
        subscription_billing: "none",
        subscription_jobs: "none",
        subscription_offerings: "none",
        subscription_subscribers: "none",
        team: "none",
        webhooks: "none",
      },
      links: {},
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

describe("createPermissionsClient", () => {
  it("sends listStandardUserRoles to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createPermissionsClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await listStandardUserRoles({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(
      `${baseUrl}/v2/permissions/standard-user-roles`,
    )
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createPermissionsClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await listStandardUserRoles({ client })

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

    await listStandardUserRoles({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/permissions/standard-user-roles",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the listStandardUserRoles response and rejects a field of the wrong type", () => {
    expect(zListStandardUserRolesResponse.parse(fixture)).toEqual(fixture)

    const [role] = fixture.data
    const tampered = { ...fixture, data: [{ ...role, name: 42 }] }
    expect(zListStandardUserRolesResponse.safeParse(tampered).success).toBe(
      false,
    )
  })
})

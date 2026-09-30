import { describe, expect, it, vi } from "vitest"
import { createIntegrationsClient, listIntegrations } from "./index"
import { zListIntegrationsResponse } from "./zod"

// Built from the property examples in the spec's schemas; the operation has no response example.
const fixture = {
  data: [
    {
      id: "2da46671-b4c2-44ac-b133-d1221aafc77b",
      type: "integration",
      name: "Order shipping notification",
      description: "Send a shipping notification via email with discount code",
      enabled: true,
      is_concurrent: false,
      integration_type: "webhook",
      observes: ["order.created"],
      configuration: {
        url: "https://yourwebsite.com/order-created-notification",
        secret_key: "secret_key_to_validate_on_your_endpoint",
      },
      links: {
        self: "https://euwest.api.elasticpath.com/v2/integrations/2da46671-b4c2-44ac-b133-d1221aafc77b",
      },
      meta: {
        timestamps: {
          created_at: "2017-07-21T17:32:28Z",
          updated_at: "2017-07-21T17:32:28Z",
        },
      },
    },
  ],
  links: {},
  results: { total: 1 },
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

describe("createIntegrationsClient", () => {
  it("sends listIntegrations under /v2 at the configured host with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createIntegrationsClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await listIntegrations({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/integrations`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createIntegrationsClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await listIntegrations({ client })

    expect(requests.map((r) => r.headers.get("Authorization"))).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
    expect(response?.status).toBe(200)
    expect(data).toEqual(fixture)
  })

  it.each([baseUrl, `${baseUrl}/v2`, `${baseUrl}/`])(
    "given %s, mints the token at the host root and sends listIntegrations under /v2",
    async (given) => {
      const { requests, transport } = stubFetch(200)
      const client = createIntegrationsClient({
        baseUrl: given,
        clientId: "id",
        clientSecret: "secret",
        fetch: transport,
      })

      await listIntegrations({ client })

      expect(requests.map((r) => r.url)).toEqual([
        `${baseUrl}/oauth/access_token`,
        `${baseUrl}/v2/integrations`,
      ])
    },
  )
})

describe("the shared client", () => {
  it("sends an operation called without a client to EU West under /v2", async () => {
    const { requests, transport } = stubFetch(200)

    await listIntegrations({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/integrations",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the listIntegrations response and rejects a field of the wrong type", () => {
    expect(zListIntegrationsResponse.parse(fixture)).toEqual(fixture)

    const [integration] = fixture.data
    const tampered = { ...fixture, data: [{ ...integration, enabled: "true" }] }
    expect(zListIntegrationsResponse.safeParse(tampered).success).toBe(false)
  })
})

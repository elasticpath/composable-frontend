import { describe, expect, it, vi } from "vitest"
import { createPersonalDataClient, getErasureRequests } from "./index"
import { zGetErasureRequestsResponse } from "./zod"

// The spec's example for getErasureRequests.
const fixture = {
  meta: {
    page: {
      limit: 10,
      offset: 0,
      current: 1,
      total: 1,
    },
    results: {
      total: 1,
    },
  },
  data: [
    {
      id: "43eb23ef-9a97-466f-9315-d0e0c9df25b5",
      type: "erasure_request",
      resource_id: "abe71c87-974d-4ced-9f83-6b8d5502b0e8",
      resource_type: "account",
      initiator: {
        "access-token-email": "accounts@molt.in",
        "access-token-id": "1222341536243515939",
        "access-token-name": "moltin test team",
        "access-token-store-id": "15ea9633-278c-4807-80f7-2009fed63c7e",
        "access-token-type": "client-credentials-token",
      },
      status: "FAILURE",
      status_description:
        "There was an error processing your request, you can retry it or report it using the id",
      created_at: "2022-05-25T10:10:58.623Z",
      updated_at: "2022-05-25T10:10:58.676Z",
    },
    {
      id: "eeb182ed-f929-4197-bb43-7104afa852f2",
      type: "erasure_request",
      resource_id: "74f98b7a-dbbf-49ed-b7a7-eaea766b8e38",
      resource_type: "address",
      initiator: {
        "access-token-email": "accounts@molt.in",
        "access-token-id": "1222341536243515939",
        "access-token-name": "moltin test team",
        "access-token-store-id": "15ea9633-278c-4807-80f7-2009fed63c7e",
        "access-token-type": "client-credentials-token",
      },
      status: "SUCCESS",
      status_description: "The erasure request is successfully processed",
      created_at: "2022-05-26T08:25:37.618Z",
      updated_at: "2022-05-26T08:25:37.698Z",
    },
    {
      id: "39787c4b-a338-4bd7-ace9-456d1ae8e90b",
      type: "erasure_request",
      resource_id: "3327fb93-b687-4c0c-a850-ee95e0303ef1",
      resource_type: "account",
      initiator: {
        "access-token-email": "accounts@molt.in",
        "access-token-id": "1222341536243515939",
        "access-token-name": "moltin test team",
        "access-token-store-id": "15ea9633-278c-4807-80f7-2009fed63c7e",
        "access-token-type": "client-credentials-token",
      },
      status: "FAILURE",
      status_description:
        "There was an error processing your request, you can retry it or report it using the id",
      created_at: "2022-05-26T08:48:56.183Z",
      updated_at: "2022-05-26T08:48:56.365Z",
    },
  ],
  links: {
    current:
      "https://useast.api.elasticpath.com/v2/personal-data/erasure-requests?filter=eq(resource_type,account_member):eq(resource_id,00000000-0000-1000-8000-000f00000300)&page[offset]=0&page[limit]=10",
    first:
      "https://useast.api.elasticpath.com/v2/personal-data/erasure-requests?filter=eq(resource_type,account_member):eq(resource_id,00000000-0000-1000-8000-000f00000300)&page[offset]=0&page[limit]=10",
    last: "https://useast.api.elasticpath.com/v2/personal-data/erasure-requests?filter=eq(resource_type,account_member):eq(resource_id,00000000-0000-1000-8000-000f00000300)&page[offset]=0&page[limit]=10",
    next: "null",
    prev: "null",
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

describe("createPersonalDataClient", () => {
  it("sends getErasureRequests to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createPersonalDataClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await getErasureRequests({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(
      `${baseUrl}/v2/personal-data/erasure-requests`,
    )
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createPersonalDataClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await getErasureRequests({ client })

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

    await getErasureRequests({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/v2/personal-data/erasure-requests",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the getErasureRequests response and rejects a field of the wrong type", () => {
    expect(zGetErasureRequestsResponse.parse(fixture)).toEqual(fixture)

    const [request] = fixture.data
    const tampered = { ...fixture, data: [{ ...request, resource_id: 42 }] }
    expect(zGetErasureRequestsResponse.safeParse(tampered).success).toBe(false)
  })
})

import { describe, expect, it, vi } from "vitest"
import { createCatalogSearchClient, listStopwordSets } from "./index"
import {
  zListStopwordSetsResponse,
  zReindexTenantReleasesResponse,
} from "./zod"

const stopwordSetsFromPropertyExamples = {
  data: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "catalog_search_stopword_set",
      attributes: {
        locale: "en",
        stopwords: ["the", "a", "an", "is"],
      },
      meta: {
        created_at: "2026-03-05T12:00:00Z",
        updated_at: "2026-03-05T12:00:00Z",
        owner: "organization",
        sync_status: "pending_sync",
        last_synced_at: "2026-03-05T12:01:00Z",
      },
    },
  ],
  meta: { results: { total: 1 } },
}

const baseUrl = "https://useast.api.elasticpath.com"

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
      return new Response(
        status === 200 ? JSON.stringify(stopwordSetsFromPropertyExamples) : "{}",
        { status, headers: { "Content-Type": "application/json" } },
      )
    },
  ) as unknown as typeof fetch
  return { requests, transport }
}

describe("createCatalogSearchClient", () => {
  it("sends listStopwordSets under /pcm at the host root with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createCatalogSearchClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await listStopwordSets({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(
      `${baseUrl}/pcm/catalogs/search/stopword-sets`,
    )
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(stopwordSetsFromPropertyExamples)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createCatalogSearchClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await listStopwordSets({ client })

    expect(requests.map((r) => r.headers.get("Authorization"))).toEqual([
      "Bearer token-1",
      "Bearer token-2",
    ])
    expect(response?.status).toBe(200)
    expect(data).toEqual(stopwordSetsFromPropertyExamples)
  })
})

describe("the shared client", () => {
  it("sends an operation called without a client to EU West with no /v2", async () => {
    const { requests, transport } = stubFetch(200)

    await listStopwordSets({ fetch: transport })

    expect(requests[0]!.url).toBe(
      "https://euwest.api.elasticpath.com/pcm/catalogs/search/stopword-sets",
    )
  })
})

describe("the /zod entry", () => {
  it("parses the listStopwordSets response and rejects a created_at that is not a string", () => {
    expect(
      zListStopwordSetsResponse.parse(stopwordSetsFromPropertyExamples),
    ).toEqual(stopwordSetsFromPropertyExamples)

    const [set] = stopwordSetsFromPropertyExamples.data
    const tampered = {
      ...stopwordSetsFromPropertyExamples,
      data: [{ ...set, meta: { ...set!.meta, created_at: 1772712000000 } }],
    }
    expect(zListStopwordSetsResponse.safeParse(tampered).success).toBe(false)
  })

  it("reports a reindex job without a type as missing it, not as the spec's out-of-enum default", () => {
    const job = {
      id: "4c9efe34-57bb-4117-abed-184008d3ae0a",
      type: "job",
      attributes: { status: "pending", type: "reindex-tenant-releases" },
    }
    expect(zReindexTenantReleasesResponse.parse(job)).toEqual(job)

    const withoutType = { ...job, attributes: { status: "pending" } }
    const result = zReindexTenantReleasesResponse.safeParse(withoutType)
    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        code: "invalid_type",
        received: "undefined",
        path: ["attributes", "type"],
      }),
    ])
  })
})

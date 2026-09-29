import { describe, expect, it, vi } from "vitest"
import { createFilesClient, getAllFiles } from "./index"
import { zGetAllFilesResponse } from "./zod"

// The spec's default example for getAllFiles.
const fixture = {
  data: [
    {
      type: "file",
      id: "f8cf26b3-6d38-4275-937a-624a83994702",
      link: {
        href: "https://files-eu.epusercontent.com/e8c53cb0-120d-4ea5-8941-ce74dec06038/f8cf26b3-6d38-4275-937a-624a83994702.png",
      },
      file_name: "f6669358-85db-4367-9cde-1deb77acb5f4.png",
      mime_type: "image/png",
      file_size: 110041,
      meta: {
        dimensions: { width: 1000, height: 1000 },
        timestamps: { created_at: "2018-03-13T13:45:21.673Z" },
      },
      links: {
        self: "https://useast.api.elasticpath.com/v2/files/f8cf26b3-6d38-4275-937a-624a83994702",
      },
    },
  ],
  links: {
    self: "https://useast.api.elasticpath.com/v2/files?page[offset]=0&page[limit]=100&filter=",
    first:
      "https://useast.api.elasticpath.com/v2/files?page[offset]=0&page[limit]=100&filter=",
    last: null,
  },
  meta: {
    page: { limit: 100, offset: 0, current: 1, total: 1 },
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

describe("createFilesClient", () => {
  it("sends getAllFiles to the configured base URL with the bearer token", async () => {
    const { requests, transport } = stubFetch(200)
    const client = createFilesClient({
      baseUrl,
      token: "pre-issued",
      fetch: transport,
    })

    const { data } = await getAllFiles({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe("GET")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/files`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer pre-issued")
    expect(data).toEqual(fixture)
  })

  it("obtains a new token on a 401 and replays the request once", async () => {
    const { requests, transport } = stubFetch(401, 200)
    let minted = 0
    const client = createFilesClient({
      baseUrl,
      provider: async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      },
      fetch: transport,
    })

    const { data, response } = await getAllFiles({ client })

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

    await getAllFiles({ fetch: transport })

    expect(requests[0]!.url).toBe("https://euwest.api.elasticpath.com/v2/files")
  })
})

describe("the /zod entry", () => {
  it("parses the getAllFiles response and rejects a field of the wrong type", () => {
    expect(zGetAllFilesResponse.parse(fixture)).toEqual(fixture)

    const [file] = fixture.data
    const tampered = { ...fixture, data: [{ ...file, file_size: "110041" }] }
    expect(zGetAllFilesResponse.safeParse(tampered).success).toBe(false)
  })
})

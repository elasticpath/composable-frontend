import { describe, expect, it } from "vitest"
import {
  createAnalyticsOffInterceptor,
  createClient,
  createConfig,
  createVisitorInterceptor,
  getByContextAllProducts,
} from "../index"
import { productListFromTheSpec } from "../test/fixtures"
import { json, stubFetch } from "../test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"
const id = "0123456789abcdef0123456789abcdef"

function clientWithInterceptors(
  ...interceptors: ReturnType<typeof createAnalyticsOffInterceptor>[]
) {
  const { requests, transport } = stubFetch(() => json(productListFromTheSpec))
  const client = createClient(createConfig({ baseUrl, fetch: transport }))
  for (const interceptor of interceptors) {
    client.interceptors.request.use(interceptor)
  }
  return { client, requests }
}

describe("createAnalyticsOffInterceptor on a client built with createClient", () => {
  it("sends EP-Analytics: off on each call", async () => {
    const { client, requests } = clientWithInterceptors(
      createAnalyticsOffInterceptor(),
    )

    await getByContextAllProducts({ client })
    await getByContextAllProducts({ client })

    expect(requests).toHaveLength(2)
    for (const request of requests) {
      expect(request.headers.get("EP-Analytics")).toBe("off")
    }
  })

  it("sends EP-Analytics: off beside the headers of a session visitor", async () => {
    const { client, requests } = clientWithInterceptors(
      createVisitorInterceptor({ kind: "session", id }),
      createAnalyticsOffInterceptor(),
    )

    await getByContextAllProducts({ client })

    expect(requests[0]!.headers.get("EP-Analytics")).toBe("off")
    expect(requests[0]!.headers.get("EP-Visitor-Id")).toBe(id)
    expect(requests[0]!.headers.get("EP-Visitor-Consent")).toBe("none")
  })

  it("sends no EP-Analytics header without the interceptor", async () => {
    const { client, requests } = clientWithInterceptors(
      createVisitorInterceptor({ kind: "objected" }),
    )

    await getByContextAllProducts({ client })

    expect(requests[0]!.headers.has("EP-Analytics")).toBe(false)
  })
})

import { describe, expect, it } from "vitest"
import {
  createClient,
  createConfig,
  createVisitorInterceptor,
  getByContextAllProducts,
} from "../index"
import { productListFromTheSpec } from "../test/fixtures"
import { json, stubFetch } from "../test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"
const id = "0123456789abcdef0123456789abcdef"

function clientWithVisitor(
  source: Parameters<typeof createVisitorInterceptor>[0],
) {
  const { requests, transport } = stubFetch(() => json(productListFromTheSpec))
  const client = createClient(createConfig({ baseUrl, fetch: transport }))
  client.interceptors.request.use(createVisitorInterceptor(source))
  return { client, requests }
}

describe("createVisitorInterceptor on a client built with createClient", () => {
  it("sends the visitor id and the granted purposes on each call", async () => {
    const { client, requests } = clientWithVisitor({
      kind: "lasting",
      id,
      purposes: ["analytics", "personalization"],
    })

    await getByContextAllProducts({ client })
    await getByContextAllProducts({ client })

    expect(requests).toHaveLength(2)
    for (const request of requests) {
      expect(request.headers.get("EP-Visitor-Id")).toBe(id)
      expect(request.headers.get("EP-Visitor-Consent")).toBe(
        "analytics,personalization",
      )
    }
  })

  it("asks a visitor function for the visitor again on every call", async () => {
    const visitors = [
      { kind: "lasting", id, purposes: ["analytics"] },
      { kind: "objected" },
    ] as const
    let calls = 0
    const { client, requests } = clientWithVisitor(
      async () => visitors[calls++]!,
    )

    await getByContextAllProducts({ client })
    await getByContextAllProducts({ client })

    expect(requests[0]!.headers.get("EP-Visitor-Id")).toBe(id)
    expect(requests[0]!.headers.get("EP-Visitor-Consent")).toBe("analytics")
    expect(requests[1]!.headers.get("EP-Visitor-Id")).toBeNull()
    expect(requests[1]!.headers.get("EP-Visitor-Consent")).toBeNull()
  })

  it.each([["none"], ["objected"]] as const)(
    "sends no visitor headers for a %s visitor",
    async (kind) => {
      const { client, requests } = clientWithVisitor({ kind })

      await getByContextAllProducts({ client })

      expect(requests[0]!.headers.get("EP-Visitor-Id")).toBeNull()
      expect(requests[0]!.headers.get("EP-Visitor-Consent")).toBeNull()
    },
  )
})

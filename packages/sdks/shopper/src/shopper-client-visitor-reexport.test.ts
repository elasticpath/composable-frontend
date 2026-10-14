import { describe, expect, it } from "vitest"
import {
  PURPOSE_ANALYTICS,
  VISITOR_CONSENT_HEADER,
  VISITOR_COOKIE,
  VISITOR_ID_HEADER,
  createShopperClient,
  getByContextAllProducts,
  resolveVisitor,
} from "./index"
import type { ConsentFunction } from "./index"
import { productListFromTheSpec } from "./test/fixtures"
import { json, stubFetch } from "./test/stub-fetch"

const analyticsOnly: ConsentFunction = () => ({
  state: "granted",
  purposes: [PURPOSE_ANALYTICS],
})

describe("the visitor contract from the shopper SDK root alone", () => {
  it("resolves a new visitor and sends it on the shopper client's calls", async () => {
    const { visitor, setCookies } = await resolveVisitor(
      new Request("https://store.example/"),
      { consent: analyticsOnly },
    )
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl: "https://useast.api.elasticpath.com", fetch: transport },
      {
        clientId: "client-id",
        tokenProvider: async () => ({ access_token: "from-provider" }),
      },
      { visitor },
    )

    await getByContextAllProducts({ client })

    expect(visitor.kind).toBe("lasting")
    const id = visitor.kind === "lasting" ? visitor.id : ""
    expect(setCookies[0]).toContain(`${VISITOR_COOKIE}=${id}`)
    expect(requests[0].headers.get(VISITOR_ID_HEADER)).toBe(id)
    expect(requests[0].headers.get(VISITOR_CONSENT_HEADER)).toBe("analytics")
  })
})

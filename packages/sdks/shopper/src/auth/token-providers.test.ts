import { describe, expect, it } from "vitest"
import {
  TokenRequestError,
  createShopperClient,
  getByContextAllProducts,
} from "../index"
import { productListFromTheSpec } from "../test/fixtures"
import {
  implicitTokenEndpoint,
  isTokenRequest,
  json,
  stubFetch,
} from "../test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"

describe("the default token provider", () => {
  it("requests an implicit token for the client ID, without a bearer token, and uses it", async () => {
    const { requests, transport } = stubFetch(
      implicitTokenEndpoint(() => json(productListFromTheSpec)),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      { clientId: "client-id" },
    )

    await getByContextAllProducts({ client })

    const [tokenRequest, operation] = requests
    expect(tokenRequest!.method).toBe("POST")
    expect(tokenRequest!.url).toBe(`${baseUrl}/oauth/access_token`)
    expect(tokenRequest!.headers.get("Authorization")).toBeNull()
    expect(
      Object.fromEntries(new URLSearchParams(await tokenRequest!.text())),
    ).toEqual({ client_id: "client-id", grant_type: "implicit" })
    expect(operation!.headers.get("Authorization")).toBe("Bearer implicit-1")
  })

  it("sends the configured headers on the token request", async () => {
    const { requests, transport } = stubFetch(
      implicitTokenEndpoint(() => json(productListFromTheSpec)),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport, headers: { "EP-Channel": "web" } },
      { clientId: "client-id" },
    )

    await getByContextAllProducts({ client })

    expect(requests.find(isTokenRequest)!.headers.get("EP-Channel")).toBe("web")
  })

  it("returns the token failure as the operation's error without sending the operation", async () => {
    const { requests, transport } = stubFetch(() =>
      json({ errors: [{ title: "Bad Request" }] }, 400),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      { clientId: "client-id" },
    )

    const { error } = await getByContextAllProducts({ client })

    expect(error).toBeInstanceOf(TokenRequestError)
    expect(requests.every(isTokenRequest)).toBe(true)
  })
})

describe("a custom tokenProvider", () => {
  it("is called with the token it replaces", async () => {
    const { transport } = stubFetch((_, seen) =>
      seen.length === 1
        ? json({ errors: [] }, 401)
        : json(productListFromTheSpec),
    )
    const calls: Array<{ current?: string }> = []
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      {
        clientId: "client-id",
        tokenProvider: async (ctx) => {
          calls.push(ctx)
          return { access_token: `token-${calls.length}` }
        },
      },
    )

    await getByContextAllProducts({ client })

    expect(calls).toEqual([{ current: undefined }, { current: "token-1" }])
  })

  it("fails the operation when it returns no access token", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      { clientId: "client-id", tokenProvider: async () => ({}) },
    )

    const { error } = await getByContextAllProducts({ client })

    expect(error).toBeInstanceOf(Error)
    expect(requests).toHaveLength(0)
  })
})

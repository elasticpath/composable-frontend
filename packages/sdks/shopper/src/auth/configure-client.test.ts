import { describe, expect, it } from "vitest"
import {
  client as sharedClient,
  configureClient,
  createShopperClient,
  getACart,
  getByContextAllProducts,
  memoryStorage,
} from "../index"
import { productListFromTheSpec } from "../test/fixtures"
import {
  implicitTokenEndpoint,
  isTokenRequest,
  json,
  stubFetch,
} from "../test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"
const storedCredentialsKey = "_store_ep_credentials"

const inAnHour = () => Math.floor(Date.now() / 1000) + 3600

describe("configureClient", () => {
  it("applies auth to the shared client and returns it", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )

    const { client } = configureClient(
      { baseUrl, fetch: transport },
      {
        clientId: "client-id",
        tokenProvider: async () => ({ access_token: "from-provider" }),
      },
    )
    const { data } = await getByContextAllProducts()

    expect(client).toBe(sharedClient)
    expect(requests[0]!.url).toBe(`${baseUrl}/catalog/products`)
    expect(requests[0]!.headers.get("Authorization")).toBe(
      "Bearer from-provider",
    )
    expect(data).toEqual(productListFromTheSpec)
  })

  it("resolves a /catalog and a /v2 operation under one host, with the implicit token request at /oauth/access_token", async () => {
    const { requests, transport } = stubFetch(
      implicitTokenEndpoint(() => json({ data: {} })),
    )

    configureClient({ baseUrl, fetch: transport }, { clientId: "client-id" })
    await getByContextAllProducts()
    await getACart({ path: { cartID: "cart-1" } })

    expect(requests.map((r) => r.url)).toEqual([
      `${baseUrl}/oauth/access_token`,
      `${baseUrl}/catalog/products`,
      `${baseUrl}/v2/carts/cart-1`,
    ])
    expect(requests[1]!.headers.get("Authorization")).toBe("Bearer implicit-1")
    expect(requests[2]!.headers.get("Authorization")).toBe("Bearer implicit-1")
  })

  it("passes configured headers through to every request", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )

    configureClient(
      { baseUrl, fetch: transport, headers: { "EP-Channel": "web" } },
      {
        clientId: "client-id",
        tokenProvider: async () => ({ access_token: "from-provider" }),
      },
    )
    await getByContextAllProducts()

    expect(requests[0]!.headers.get("EP-Channel")).toBe("web")
  })
})

describe("retry", () => {
  const unavailable = () => json({ errors: [] }, 503)
  const provider = async () => ({ access_token: "from-provider" })

  it("repeats a 5xx GET by default", async () => {
    const { requests, transport } = stubFetch(unavailable)
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      {
        clientId: "client-id",
        tokenProvider: provider,
        retry: { sleep: async () => {} },
      },
    )

    await getByContextAllProducts({ client })

    expect(requests.length).toBeGreaterThan(1)
  })

  it("returns a 5xx GET without repeating it when retry is false", async () => {
    const { requests, transport } = stubFetch(unavailable)
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      { clientId: "client-id", tokenProvider: provider, retry: false },
    )

    const { response } = await getByContextAllProducts({ client })

    expect(requests).toHaveLength(1)
    expect(response?.status).toBe(503)
  })
})

describe("wrapUserFetch: false", () => {
  it("sends the caller's fetch the request without an Authorization header", async () => {
    const { requests, transport } = stubFetch(() =>
      json(productListFromTheSpec),
    )
    let minted = 0
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      {
        clientId: "client-id",
        tokenProvider: async () => {
          minted += 1
          return { access_token: "from-provider" }
        },
        wrapUserFetch: false,
      },
    )

    await getByContextAllProducts({ client })

    expect(requests).toHaveLength(1)
    expect(requests[0]!.headers.get("Authorization")).toBeNull()
    expect(minted).toBe(0)
  })
})

describe("stored tokens", () => {
  it("reads a token response stored by 0.5.x without a token request", async () => {
    localStorage.setItem(
      storedCredentialsKey,
      JSON.stringify({
        access_token: "stored-by-0.5",
        token_type: "Bearer",
        identifier: "implicit",
        expires_in: 3600,
        expires: inAnHour(),
      }),
    )
    const { requests, transport } = stubFetch(
      implicitTokenEndpoint(() => json(productListFromTheSpec)),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      { clientId: "client-id" },
    )

    await getByContextAllProducts({ client })

    expect(requests.filter(isTokenRequest)).toHaveLength(0)
    expect(requests[0]!.headers.get("Authorization")).toBe(
      "Bearer stored-by-0.5",
    )
  })

  it("reads a bare token string stored under the same key", async () => {
    localStorage.setItem(storedCredentialsKey, "bare-token")
    const { requests, transport } = stubFetch(
      implicitTokenEndpoint(() => json(productListFromTheSpec)),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      { clientId: "client-id" },
    )

    await getByContextAllProducts({ client })

    expect(requests.filter(isTokenRequest)).toHaveLength(0)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer bare-token")
  })

  it("stores a minted token under the 0.5.x key", async () => {
    const { transport } = stubFetch(
      implicitTokenEndpoint(() => json(productListFromTheSpec)),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      { clientId: "client-id" },
    )

    await getByContextAllProducts({ client })

    expect(
      JSON.parse(localStorage.getItem(storedCredentialsKey)!),
    ).toMatchObject({ access_token: "implicit-1" })
  })

  it("uses a storage adapter passed in place of a storage name", async () => {
    const storage = memoryStorage("from-adapter")
    const { requests, transport } = stubFetch(
      implicitTokenEndpoint(() => json(productListFromTheSpec)),
    )
    const { client } = createShopperClient(
      { baseUrl, fetch: transport },
      { clientId: "client-id", storage },
    )

    await getByContextAllProducts({ client })

    expect(requests[0]!.headers.get("Authorization")).toBe(
      "Bearer from-adapter",
    )
    expect(localStorage.getItem(storedCredentialsKey)).toBeNull()
  })
})

describe("the returned auth object", () => {
  it("gets, refreshes, reads and clears the token", async () => {
    let minted = 0
    const { auth } = createShopperClient(
      { baseUrl },
      {
        clientId: "client-id",
        tokenProvider: async () => {
          minted += 1
          return { access_token: `token-${minted}`, expires: inAnHour() }
        },
      },
    )

    expect(auth.getSnapshot()).toBeUndefined()
    expect(await auth.getValidAccessToken()).toBe("token-1")
    expect(await auth.getValidAccessToken()).toBe("token-1")
    expect(auth.getSnapshot()).toBe("token-1")
    expect(await auth.refresh()).toBe("token-2")
    expect(localStorage.getItem(storedCredentialsKey)).not.toBeNull()

    auth.clear()

    expect(auth.getSnapshot()).toBeUndefined()
    expect(localStorage.getItem(storedCredentialsKey)).toBeNull()
  })
})

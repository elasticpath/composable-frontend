// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cookieAdapter } from "./storage"
import { createShopperClient, getByContextAllProducts } from "../index"
import { productListFromTheSpec } from "../test/fixtures"
import {
  implicitTokenEndpoint,
  isTokenRequest,
  json,
  stubFetch,
} from "../test/stub-fetch"

const defaultCookieName = "_store_ep_credentials"

function cookieValue(name: string) {
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
  return entry && decodeURIComponent(entry.slice(name.length + 1))
}

afterEach(() => {
  for (const entry of document.cookie.split("; ").filter(Boolean)) {
    document.cookie = `${entry.split("=")[0]}=; Max-Age=0; Path=/`
  }
})

describe("cookieAdapter", () => {
  it("round-trips a value and removes it", () => {
    const adapter = cookieAdapter({ name: "cookie_k", sameSite: "Lax" })

    expect(adapter.get()).toBeUndefined()
    adapter.set("CT")
    expect(adapter.get()).toBe("CT")
    adapter.set(undefined)
    expect(adapter.get()).toBeUndefined()
  })

  it("defaults the cookie name to the stored credentials key", () => {
    cookieAdapter().set("DEFAULT")

    expect(cookieValue(defaultCookieName)).toBe("DEFAULT")
  })

  it("decodes a JSON value written by 0.5.x", () => {
    document.cookie = `${defaultCookieName}=${encodeURIComponent(
      JSON.stringify({ access_token: "from-0.5" }),
    )}; Path=/`

    expect(JSON.parse(cookieAdapter().get()!)).toEqual({
      access_token: "from-0.5",
    })
  })
})

describe('createShopperClient with storage: "cookie"', () => {
  const baseUrl = "https://useast.api.elasticpath.com"

  it("stores the minted token in the cookie and reads it back in a new client", async () => {
    const { requests, transport } = stubFetch(
      implicitTokenEndpoint(() => json(productListFromTheSpec)),
    )
    const build = () =>
      createShopperClient(
        { baseUrl, fetch: transport },
        { clientId: "client-id", storage: "cookie" },
      ).client

    await getByContextAllProducts({ client: build() })
    await getByContextAllProducts({ client: build() })

    expect(JSON.parse(cookieValue(defaultCookieName)!)).toMatchObject({
      access_token: "implicit-1",
    })
    expect(requests.filter(isTokenRequest)).toHaveLength(1)
    expect(localStorage.getItem(defaultCookieName)).toBeNull()
  })
})

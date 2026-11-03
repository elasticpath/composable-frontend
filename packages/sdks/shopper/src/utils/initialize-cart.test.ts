import { beforeEach, describe, expect, it } from "vitest"
import { client, getCartId, initializeCart } from "../index"
import { json, stubFetch, type Route } from "../test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"
const defaultCartKey = "_store_ep_cart"

function stubSharedClient(route: Route) {
  const stub = stubFetch(route)
  client.setConfig({ baseUrl, fetch: stub.transport })
  return stub
}

describe("initializeCart", () => {
  beforeEach(async () => {
    localStorage.setItem(defaultCartKey, "resets-the-remembered-key")
    await initializeCart({ storageKey: defaultCartKey })
    localStorage.clear()
  })

  it("returns the stored cart ID without creating a cart", async () => {
    localStorage.setItem(defaultCartKey, "existing-cart")
    const { requests } = stubSharedClient(() => json({}))

    expect(await initializeCart()).toBe("existing-cart")
    expect(requests).toHaveLength(0)
  })

  it("creates a cart, stores its ID and returns it", async () => {
    const { requests } = stubSharedClient(() =>
      json({ data: { id: "new-cart" } }, 201),
    )

    expect(await initializeCart()).toBe("new-cart")
    expect(requests[0]!.method).toBe("POST")
    expect(requests[0]!.url).toBe(`${baseUrl}/v2/carts`)
    expect(await requests[0]!.json()).toEqual({
      data: {
        name: "Storefront cart",
        description: "Standard cart created by the Storefront SDK",
      },
    })
    expect(localStorage.getItem(defaultCartKey)).toBe("new-cart")
    expect(getCartId()).toBe("new-cart")
  })

  it("stores the cart ID under a custom key", async () => {
    stubSharedClient(() => json({ data: { id: "new-cart" } }, 201))

    await initializeCart({ storageKey: "custom-cart-key" })

    expect(localStorage.getItem("custom-cart-key")).toBe("new-cart")
    expect(getCartId({ storageKey: "custom-cart-key" })).toBe("new-cart")
  })

  it("throws when the created cart has no ID", async () => {
    stubSharedClient(() => json({ data: {} }, 201))

    await expect(initializeCart()).rejects.toThrow("Failed to create cart")
  })

  it("throws when the cart request fails", async () => {
    stubSharedClient(() => json({ errors: [] }, 500))

    await expect(initializeCart()).rejects.toThrow("Failed to create cart")
  })
})

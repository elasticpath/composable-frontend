import { describe, test, expect, vi, beforeEach } from "vitest"

const postMultiSearch = vi.fn()
const getByContextAllProducts = vi.fn()

vi.mock("@epcc-sdk/sdks-shopper", () => ({
  postMultiSearch: (...args: unknown[]) => postMultiSearch(...args),
  getByContextAllProducts: (...args: unknown[]) =>
    getByContextAllProducts(...args),
}))

import {
  fetchBundlesContainingProduct,
  COMPONENT_OPTION_ID_FIELD,
} from "./fetch-bundles-containing-product"

const PRODUCT_ID = "a6d22789-d395-41e5-ad0c-9e558e7a41d0"
const BUNDLE_ID = "2e4dd226-1b3e-4c2f-9a5f-6d1d1f0a7c11"

const client = {} as any

function searchReturning(ids: string[]) {
  return {
    data: {
      results: [
        {
          found: ids.length,
          hits: ids.map((id) => ({ document: { id, type: "product" } })),
        },
      ],
    },
  }
}

function firstCallOptions(mock: typeof postMultiSearch): any {
  const call = mock.mock.calls[0]
  expect(call).toBeDefined()
  return call![0]
}

beforeEach(() => {
  postMultiSearch.mockReset()
  getByContextAllProducts.mockReset()
})

describe("fetchBundlesContainingProduct", () => {
  test("filters the catalog search on the component option field for the product", async () => {
    postMultiSearch.mockResolvedValue(searchReturning([]))

    await fetchBundlesContainingProduct(client, PRODUCT_ID)

    const options = firstCallOptions(postMultiSearch)
    expect(options.body.searches[0].filter_by).toBe(
      `${COMPONENT_OPTION_ID_FIELD}:=${PRODUCT_ID}`,
    )
  })

  test("returns the products for the bundles the search found, with main images attached", async () => {
    postMultiSearch.mockResolvedValue(searchReturning([BUNDLE_ID]))
    getByContextAllProducts.mockResolvedValue({
      data: {
        data: [
          {
            id: BUNDLE_ID,
            attributes: { name: "Playstation 5 Bundle 1" },
            relationships: {
              main_image: { data: { id: "image-1", type: "main_image" } },
            },
          },
        ],
        included: {
          main_images: [
            { id: "image-1", link: { href: "https://example.test/ps5.webp" } },
          ],
        },
      },
    })

    const bundles = await fetchBundlesContainingProduct(client, PRODUCT_ID)

    expect(bundles).toHaveLength(1)
    expect(bundles[0]?.id).toBe(BUNDLE_ID)
    expect(bundles[0]?.main_image?.link?.href).toBe(
      "https://example.test/ps5.webp",
    )

    const options = firstCallOptions(getByContextAllProducts)
    expect(options.query.filter).toBe(`in(id,${BUNDLE_ID})`)
    expect(options.query.include).toContain("main_image")
  })

  test("returns the products even when the catalog carries no images for them", async () => {
    postMultiSearch.mockResolvedValue(searchReturning([BUNDLE_ID]))
    getByContextAllProducts.mockResolvedValue({
      data: { data: [{ id: BUNDLE_ID, attributes: { name: "Fixed bundle" } }] },
    })

    const bundles = await fetchBundlesContainingProduct(client, PRODUCT_ID)

    expect(bundles).toHaveLength(1)
    expect(bundles[0]?.main_image).toBeUndefined()
  })

  test("returns no bundles, and fetches no products, when the search finds nothing", async () => {
    postMultiSearch.mockResolvedValue(searchReturning([]))

    await expect(
      fetchBundlesContainingProduct(client, PRODUCT_ID),
    ).resolves.toEqual([])
    expect(getByContextAllProducts).not.toHaveBeenCalled()
  })

  test("returns no bundles when the search responds with an error", async () => {
    // A filter naming an unindexed field answers HTTP 400, not an empty result set.
    postMultiSearch.mockResolvedValue({
      error: {
        errors: [
          {
            status: "400",
            title: "Validation Error",
            detail: `Could not find a filter field named '${COMPONENT_OPTION_ID_FIELD}'`,
          },
        ],
      },
    })

    await expect(
      fetchBundlesContainingProduct(client, PRODUCT_ID),
    ).resolves.toEqual([])
    expect(getByContextAllProducts).not.toHaveBeenCalled()
  })

  test("returns no bundles when the search throws", async () => {
    postMultiSearch.mockRejectedValue(new Error("network down"))

    await expect(
      fetchBundlesContainingProduct(client, PRODUCT_ID),
    ).resolves.toEqual([])
  })

  test("returns no bundles when fetching the bundle products fails", async () => {
    postMultiSearch.mockResolvedValue(searchReturning([BUNDLE_ID]))
    getByContextAllProducts.mockRejectedValue(new Error("network down"))

    await expect(
      fetchBundlesContainingProduct(client, PRODUCT_ID),
    ).resolves.toEqual([])
  })

  test("ignores hits without an id and asks for each id once", async () => {
    postMultiSearch.mockResolvedValue({
      data: {
        results: [
          {
            hits: [
              { document: { id: BUNDLE_ID } },
              { document: { id: BUNDLE_ID } },
              { document: {} },
              {},
            ],
          },
        ],
      },
    })
    getByContextAllProducts.mockResolvedValue({
      data: { data: [{ id: BUNDLE_ID }] },
    })

    await fetchBundlesContainingProduct(client, PRODUCT_ID)

    const options = firstCallOptions(getByContextAllProducts)
    expect(options.query.filter).toBe(`in(id,${BUNDLE_ID})`)
  })

  test("passes the shopper's language and currency to both requests", async () => {
    postMultiSearch.mockResolvedValue(searchReturning([BUNDLE_ID]))
    getByContextAllProducts.mockResolvedValue({
      data: { data: [{ id: BUNDLE_ID }] },
    })

    await fetchBundlesContainingProduct(client, PRODUCT_ID, {
      lang: "en-GB",
      currencyCode: "GBP",
    })

    expect(firstCallOptions(postMultiSearch).headers["Accept-Language"]).toBe(
      "en-GB",
    )
    const productHeaders = firstCallOptions(getByContextAllProducts).headers
    expect(productHeaders["Accept-Language"]).toBe("en-GB")
    expect(productHeaders["X-Moltin-Currency"]).toBe("GBP")
  })
})

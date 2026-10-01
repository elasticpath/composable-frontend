import { describe, test, expect, vi, beforeEach } from "vitest"

const getByContextAllRelatedProducts = vi.fn()
const getAllFiles = vi.fn()

vi.mock("@epcc-sdk/sdks-shopper", () => ({
  getByContextAllRelatedProducts: (...args: unknown[]) =>
    getByContextAllRelatedProducts(...args),
  getAllFiles: (...args: unknown[]) => getAllFiles(...args),
}))

import {
  fetchRelatedProducts,
  RELATED_PRODUCTS_SLUG,
  RELATED_PRODUCTS_HEADING,
} from "./fetch-related-products"

const PRODUCT_ID = "a6d22789-d395-41e5-ad0c-9e558e7a41d0"
const RELATED_ID = "2e4dd226-1b3e-4c2f-9a5f-6d1d1f0a7c11"
const OTHER_RELATED_ID = "7b1c9e40-5d2a-4f8e-b3c6-0a9d8e7f6c55"

const client = {} as any

function relatedReturning(products: unknown[]) {
  return { data: { data: products } }
}

function withMainImage(id: string, imageId: string) {
  return {
    id,
    attributes: { name: id },
    relationships: {
      main_image: { data: { id: imageId, type: "main_image" } },
    },
  }
}

function firstCallOptions(mock: typeof getAllFiles): any {
  const call = mock.mock.calls[0]
  expect(call).toBeDefined()
  return call![0]
}

beforeEach(() => {
  getByContextAllRelatedProducts.mockReset()
  getAllFiles.mockReset()
})

describe("related products constants", () => {
  test("pin one relationship slug and one heading as plain values", () => {
    expect(RELATED_PRODUCTS_SLUG).toMatch(/^CRP_[\w-]+$/)
    expect(RELATED_PRODUCTS_HEADING.trim()).not.toBe("")
  })
})

describe("fetchRelatedProducts", () => {
  test("asks for the pinned relationship of the product", async () => {
    getByContextAllRelatedProducts.mockResolvedValue(relatedReturning([]))

    await fetchRelatedProducts(client, PRODUCT_ID)

    const options = firstCallOptions(getByContextAllRelatedProducts)
    expect(options.path).toEqual({
      product_id: PRODUCT_ID,
      custom_relationship_slug: RELATED_PRODUCTS_SLUG,
    })
  })

  test("returns the related products in relationship order with main images from one typed files request", async () => {
    getByContextAllRelatedProducts.mockResolvedValue(
      relatedReturning([
        withMainImage(RELATED_ID, "image-1"),
        withMainImage(OTHER_RELATED_ID, "image-2"),
      ]),
    )
    getAllFiles.mockResolvedValue({
      data: {
        data: [
          { id: "image-2", link: { href: "https://example.test/two.webp" } },
          { id: "image-1", link: { href: "https://example.test/one.webp" } },
        ],
      },
    })

    const related = await fetchRelatedProducts(client, PRODUCT_ID)

    expect(related.map((p) => p.id)).toEqual([RELATED_ID, OTHER_RELATED_ID])
    expect(related.map((p) => p.main_image?.link?.href)).toEqual([
      "https://example.test/one.webp",
      "https://example.test/two.webp",
    ])
    expect(getAllFiles).toHaveBeenCalledTimes(1)
    expect(firstCallOptions(getAllFiles).query.filter).toBe(
      "in(id,image-1,image-2)",
    )
  })

  test("asks for each image once when related products share one", async () => {
    getByContextAllRelatedProducts.mockResolvedValue(
      relatedReturning([
        withMainImage(RELATED_ID, "image-1"),
        withMainImage(OTHER_RELATED_ID, "image-1"),
      ]),
    )
    getAllFiles.mockResolvedValue({ data: { data: [] } })

    await fetchRelatedProducts(client, PRODUCT_ID)

    expect(firstCallOptions(getAllFiles).query.filter).toBe("in(id,image-1)")
  })

  test("returns related products without images, and fetches no files, when none has a main image", async () => {
    getByContextAllRelatedProducts.mockResolvedValue(
      relatedReturning([{ id: RELATED_ID, attributes: { name: "Plain" } }]),
    )

    const related = await fetchRelatedProducts(client, PRODUCT_ID)

    expect(related).toHaveLength(1)
    expect(related[0]?.main_image).toBeUndefined()
    expect(getAllFiles).not.toHaveBeenCalled()
  })

  test("returns nothing, and fetches no files, when the relationship is empty or the store has no such slug", async () => {
    getByContextAllRelatedProducts.mockResolvedValue(relatedReturning([]))

    await expect(fetchRelatedProducts(client, PRODUCT_ID)).resolves.toEqual([])
    expect(getAllFiles).not.toHaveBeenCalled()
  })

  test("returns nothing when the relationship request responds with an error", async () => {
    getByContextAllRelatedProducts.mockResolvedValue({
      error: { errors: [{ status: "500", title: "Internal Server Error" }] },
    })

    await expect(fetchRelatedProducts(client, PRODUCT_ID)).resolves.toEqual([])
    expect(getAllFiles).not.toHaveBeenCalled()
  })

  test("returns nothing when the relationship request throws", async () => {
    getByContextAllRelatedProducts.mockRejectedValue(new Error("network down"))

    await expect(fetchRelatedProducts(client, PRODUCT_ID)).resolves.toEqual([])
  })

  test("returns nothing when the files request responds with an error", async () => {
    getByContextAllRelatedProducts.mockResolvedValue(
      relatedReturning([withMainImage(RELATED_ID, "image-1")]),
    )
    getAllFiles.mockResolvedValue({
      error: { errors: [{ status: "500", title: "Internal Server Error" }] },
    })

    await expect(fetchRelatedProducts(client, PRODUCT_ID)).resolves.toEqual([])
  })

  test("returns nothing when the files request throws", async () => {
    getByContextAllRelatedProducts.mockResolvedValue(
      relatedReturning([withMainImage(RELATED_ID, "image-1")]),
    )
    getAllFiles.mockRejectedValue(new Error("network down"))

    await expect(fetchRelatedProducts(client, PRODUCT_ID)).resolves.toEqual([])
  })

  test("lets a malformed file list throw instead of hiding the section", async () => {
    getByContextAllRelatedProducts.mockResolvedValue(
      relatedReturning([withMainImage(RELATED_ID, "image-1")]),
    )
    getAllFiles.mockResolvedValue({ data: { data: [null] } })

    await expect(fetchRelatedProducts(client, PRODUCT_ID)).rejects.toThrow(
      TypeError,
    )
  })

  test("passes the shopper's language and currency, and caps the strip", async () => {
    getByContextAllRelatedProducts.mockResolvedValue(relatedReturning([]))

    await fetchRelatedProducts(client, PRODUCT_ID, {
      lang: "en-GB",
      currencyCode: "GBP",
    })

    const options = firstCallOptions(getByContextAllRelatedProducts)
    expect(options.headers["Accept-Language"]).toBe("en-GB")
    expect(options.headers["X-Moltin-Currency"]).toBe("GBP")
    expect(Number(options.query["page[limit]"])).toBe(4)
  })
})

import { describe, expect, test } from "vitest"
import { listableProducts } from "./listable-products"

const product = (
  overrides: {
    id?: string
    name?: string
    types?: string[]
    price?: { with_tax?: string; without_tax?: string } | null
  } = {},
) => ({
  id: "id" in overrides ? overrides.id : "mug",
  attributes: { name: overrides.name ?? "Mug", sku: "MUG-1" },
  meta: {
    product_types: overrides.types ?? ["standard"],
    display_price:
      overrides.price === null
        ? undefined
        : {
            with_tax: {
              formatted: overrides.price?.with_tax ?? "$10.00",
            },
            ...(overrides.price?.without_tax
              ? { without_tax: { formatted: overrides.price.without_tax } }
              : {}),
          },
  },
})

describe("listableProducts", () => {
  test("keeps a standard product that has a price", () => {
    expect(listableProducts([product()])).toEqual([
      { id: "mug", name: "Mug", sku: "MUG-1", price: "$10.00" },
    ])
  })

  test.each(["parent", "child", "bundle"])(
    "leaves out a %s product, which cannot be added with a bare product id",
    (type) => {
      expect(listableProducts([product({ types: [type] })])).toEqual([])
    },
  )

  test("leaves out a product with no price, which the cart would refuse", () => {
    expect(listableProducts([product({ price: null })])).toEqual([])
  })

  test("falls back to the price without tax when the with-tax price is absent", () => {
    const withoutTaxOnly = {
      ...product(),
      meta: {
        product_types: ["standard"],
        display_price: { without_tax: { formatted: "$9.00" } },
      },
    }

    expect(listableProducts([withoutTaxOnly])[0]?.price).toBe("$9.00")
  })

  test("leaves out a product with no id", () => {
    expect(listableProducts([product({ id: undefined })])).toEqual([])
  })

  test("stops at the limit", () => {
    const many = Array.from({ length: 5 }, (_, i) =>
      product({ id: `p${i}`, name: `Product ${i}` }),
    )

    expect(listableProducts(many, 3).map((p) => p.id)).toEqual([
      "p0",
      "p1",
      "p2",
    ])
  })

  test("counts only listable products against the limit", () => {
    const mixed = [
      product({ id: "parent", types: ["parent"] }),
      product({ id: "a" }),
      product({ id: "b" }),
    ]

    expect(listableProducts(mixed, 2).map((p) => p.id)).toEqual(["a", "b"])
  })
})

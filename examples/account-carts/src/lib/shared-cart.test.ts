import { describe, expect, test } from "vitest"
import { toSharedCart } from "./shared-cart"

const priced = (formatted: string) => ({ with_tax: { value: { formatted } } })

describe("toSharedCart", () => {
  test("lists each line with its product id, quantity and line total, and the cart total", () => {
    const cart = toSharedCart({
      data: { meta: { display_price: { with_tax: { formatted: "$30.00" } } } },
      included: {
        items: [
          {
            id: "item-mug",
            product_id: "product-mug",
            type: "cart_item",
            name: "Mug",
            quantity: 2,
            meta: { display_price: priced("$20.00") },
          },
          {
            id: "item-poster",
            product_id: "product-poster",
            type: "cart_item",
            name: "Poster",
            quantity: 1,
            meta: { display_price: priced("$10.00") },
          },
        ],
      },
    })

    expect(cart).toEqual({
      lines: [
        {
          id: "item-mug",
          productId: "product-mug",
          name: "Mug",
          quantity: 2,
          lineTotal: "$20.00",
        },
        {
          id: "item-poster",
          productId: "product-poster",
          name: "Poster",
          quantity: 1,
          lineTotal: "$10.00",
        },
      ],
      itemCount: 3,
      total: "$30.00",
    })
  })

  test("has no lines when the cart carries no items", () => {
    expect(toSharedCart({ data: {} }).lines).toEqual([])
  })

  test("skips an item with no id and names an item with no name", () => {
    const cart = toSharedCart({
      data: {},
      included: {
        items: [{ quantity: 1 }, { id: "item-1", quantity: 1 }],
      },
    })

    expect(cart.lines).toEqual([
      {
        id: "item-1",
        productId: undefined,
        name: "Unnamed item",
        quantity: 1,
        lineTotal: undefined,
      },
    ])
  })
})

import { describe, expect, test } from "vitest"
import { toListedCart, toCartView } from "./cart-view"

const priced = (formatted: string) => ({ with_tax: { formatted } })

describe("toCartView", () => {
  test("lists each line with its quantity and line total", () => {
    const view = toCartView({
      data: {
        id: "cart-1",
        meta: { display_price: priced("$30.00") },
      },
      included: {
        items: [
          {
            id: "line-1",
            type: "cart_item",
            name: "Mug",
            quantity: 2,
            meta: {
              display_price: { with_tax: { value: { formatted: "$20.00" } } },
            },
          },
          {
            id: "line-2",
            type: "cart_item",
            name: "Poster",
            quantity: 1,
            meta: {
              display_price: { with_tax: { value: { formatted: "$10.00" } } },
            },
          },
        ],
      },
    })

    expect(view.lines).toEqual([
      { id: "line-1", name: "Mug", quantity: 2, lineTotal: "$20.00" },
      { id: "line-2", name: "Poster", quantity: 1, lineTotal: "$10.00" },
    ])
    expect(view.total).toBe("$30.00")
  })

  test("counts units, not lines", () => {
    const view = toCartView({
      data: { id: "cart-1" },
      included: {
        items: [
          { id: "a", type: "cart_item", name: "Mug", quantity: 2 },
          { id: "b", type: "cart_item", name: "Poster", quantity: 3 },
        ],
      },
    })

    expect(view.itemCount).toBe(5)
  })

  test("an empty cart has no lines and a zero count", () => {
    const view = toCartView({ data: { id: "cart-1" } })

    expect(view).toEqual({ lines: [], itemCount: 0, total: undefined })
  })

  test("an empty cart has no total even when the store answers a bare zero", () => {
    const view = toCartView({
      data: { id: "cart-1", meta: { display_price: priced("0") } },
    })

    expect(view.total).toBeUndefined()
  })

  test("falls back to a placeholder name and leaves a missing price blank", () => {
    const view = toCartView({
      data: { id: "cart-1" },
      included: { items: [{ id: "a", type: "cart_item", quantity: 1 }] },
    })

    expect(view.lines).toEqual([
      {
        id: "a",
        name: "Unnamed item",
        quantity: 1,
        lineTotal: undefined,
      },
    ])
  })

  test("skips an included item that has no id", () => {
    const view = toCartView({
      data: { id: "cart-1" },
      included: { items: [{ type: "cart_item", name: "Ghost", quantity: 1 }] },
    })

    expect(view.lines).toEqual([])
  })
})

describe("toListedCart", () => {
  test("reads the id, name, last update time and expiry time", () => {
    expect(
      toListedCart({
        id: "cart-1",
        name: "Weekly order",
        meta: {
          timestamps: {
            updated_at: "2026-10-05T09:00:00.000Z",
            expires_at: "2026-10-12T09:00:00.000Z",
          },
        },
      }),
    ).toEqual({
      id: "cart-1",
      name: "Weekly order",
      updatedAt: "2026-10-05T09:00:00.000Z",
      expiresAt: "2026-10-12T09:00:00.000Z",
      isQuote: false,
    })
  })

  test("marks a quote as a quote", () => {
    expect(toListedCart({ id: "cart-1", is_quote: true })?.isQuote).toBe(true)
  })

  test("returns nothing for a cart that has no id", () => {
    expect(toListedCart({})).toBeNull()
  })
})

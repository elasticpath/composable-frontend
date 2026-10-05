import { describe, expect, test } from "vitest"
import { chooseDeletion } from "./delete-cart"

const cart = (id: string, isQuote = false) => ({ id, isQuote })

describe("chooseDeletion", () => {
  test("deletes a cart outright when the account holds another cart", () => {
    expect(
      chooseDeletion({
        carts: [cart("active"), cart("saved")],
        cartId: "saved",
      }),
    ).toEqual({ disassociateFirst: false, createReplacement: false })
  })

  test("disassociates before deleting when the cart is the only cart the account holds", () => {
    expect(chooseDeletion({ carts: [cart("only")], cartId: "only" })).toEqual({
      disassociateFirst: true,
      createReplacement: true,
    })
  })

  test("deletes outright when the only other cart is a quote, but still creates a cart to shop in", () => {
    expect(
      chooseDeletion({
        carts: [cart("quote", true), cart("only")],
        cartId: "only",
      }),
    ).toEqual({ disassociateFirst: false, createReplacement: true })
  })

  test("does not create a replacement when another cart can still be the active cart", () => {
    expect(
      chooseDeletion({
        carts: [cart("quote", true), cart("kept"), cart("gone")],
        cartId: "gone",
      }).createReplacement,
    ).toBe(false)
  })
})

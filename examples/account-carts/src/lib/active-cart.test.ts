import { describe, expect, test } from "vitest"
import { chooseActiveCart, type CartCandidate } from "./active-cart"

const cart = (
  id: string,
  updatedAt: string | undefined,
  isQuote = false,
): CartCandidate => ({ id, updatedAt, isQuote })

const MONDAY = "2026-10-05T09:00:00.000Z"
const TUESDAY = "2026-10-06T09:00:00.000Z"
const WEDNESDAY = "2026-10-07T09:00:00.000Z"

describe("chooseActiveCart", () => {
  test("keeps the cart named by the cookie while the account still holds it", () => {
    const choice = chooseActiveCart({
      cookieCartId: "older",
      carts: [cart("newer", WEDNESDAY), cart("older", MONDAY)],
    })

    expect(choice).toEqual({ kind: "existing", cartId: "older" })
  })

  test("ignores a cookie cart the account no longer holds", () => {
    const choice = chooseActiveCart({
      cookieCartId: "gone",
      carts: [cart("mine", MONDAY)],
    })

    expect(choice).toEqual({ kind: "existing", cartId: "mine" })
  })

  test("without a cookie, picks the most recently updated cart", () => {
    const choice = chooseActiveCart({
      cookieCartId: undefined,
      carts: [
        cart("monday", MONDAY),
        cart("wednesday", WEDNESDAY),
        cart("tuesday", TUESDAY),
      ],
    })

    expect(choice).toEqual({ kind: "existing", cartId: "wednesday" })
  })

  test("never picks a quote, even when it is the most recently updated", () => {
    const choice = chooseActiveCart({
      cookieCartId: undefined,
      carts: [cart("quote", WEDNESDAY, true), cart("cart", MONDAY)],
    })

    expect(choice).toEqual({ kind: "existing", cartId: "cart" })
  })

  test("does not keep a quote just because the cookie names it", () => {
    const choice = chooseActiveCart({
      cookieCartId: "quote",
      carts: [cart("quote", WEDNESDAY, true), cart("cart", MONDAY)],
    })

    expect(choice).toEqual({ kind: "existing", cartId: "cart" })
  })

  test("asks for a new cart when the account holds none", () => {
    expect(chooseActiveCart({ cookieCartId: undefined, carts: [] })).toEqual({
      kind: "create",
    })
    expect(chooseActiveCart({ cookieCartId: "gone", carts: [] })).toEqual({
      kind: "create",
    })
  })

  test("asks for a new cart when every cart the account holds is a quote", () => {
    const choice = chooseActiveCart({
      cookieCartId: undefined,
      carts: [cart("quote", WEDNESDAY, true)],
    })

    expect(choice).toEqual({ kind: "create" })
  })

  test("treats a cart with no update time as the oldest", () => {
    const choice = chooseActiveCart({
      cookieCartId: undefined,
      carts: [cart("undated", undefined), cart("dated", MONDAY)],
    })

    expect(choice).toEqual({ kind: "existing", cartId: "dated" })
  })

  test("treats an unreadable update time as the oldest", () => {
    const choice = chooseActiveCart({
      cookieCartId: undefined,
      carts: [cart("garbled", "not a date"), cart("dated", MONDAY)],
    })

    expect(choice).toEqual({ kind: "existing", cartId: "dated" })
  })

  test("keeps the order Elastic Path listed when update times are equal", () => {
    const choice = chooseActiveCart({
      cookieCartId: undefined,
      carts: [cart("first", MONDAY), cart("second", MONDAY)],
    })

    expect(choice).toEqual({ kind: "existing", cartId: "first" })
  })

  test("does not reorder the list it was given", () => {
    const carts = [cart("monday", MONDAY), cart("wednesday", WEDNESDAY)]

    chooseActiveCart({ cookieCartId: undefined, carts })

    expect(carts.map((c) => c.id)).toEqual(["monday", "wednesday"])
  })
})

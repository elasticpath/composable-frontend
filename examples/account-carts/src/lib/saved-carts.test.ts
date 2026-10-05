import { describe, expect, test } from "vitest"
import type { CartView, CartsPort, ListedCart } from "./cart-service"
import {
  UNNAMED_CART,
  cartHandle,
  listSavedCarts,
  resolveCartHandle,
  savedCartsOf,
} from "./saved-carts"

const MONDAY = "2026-10-05T09:00:00.000Z"
const TUESDAY = "2026-10-06T09:00:00.000Z"
const WEDNESDAY = "2026-10-07T09:00:00.000Z"

const cart = (
  id: string,
  updatedAt: string,
  overrides: Partial<ListedCart> = {},
): ListedCart => ({
  id,
  name: id,
  updatedAt,
  expiresAt: "2026-10-14T09:00:00.000Z",
  isQuote: false,
  ...overrides,
})

describe("savedCartsOf", () => {
  test("lists every cart except the active one", () => {
    const saved = savedCartsOf(
      [cart("monday", MONDAY), cart("wednesday", WEDNESDAY)],
      undefined,
    )

    expect(saved.map((c) => c.id)).toEqual(["monday"])
  })

  test("leaves out the cart the cookie names, whichever is most recent", () => {
    const saved = savedCartsOf(
      [cart("monday", MONDAY), cart("wednesday", WEDNESDAY)],
      "monday",
    )

    expect(saved.map((c) => c.id)).toEqual(["wednesday"])
  })

  test("leaves out quotes", () => {
    const saved = savedCartsOf(
      [
        cart("active", WEDNESDAY),
        cart("quote", TUESDAY, { isQuote: true }),
        cart("monday", MONDAY),
      ],
      undefined,
    )

    expect(saved.map((c) => c.id)).toEqual(["monday"])
  })

  test("lists the most recently changed first", () => {
    const saved = savedCartsOf(
      [
        cart("monday", MONDAY),
        cart("active", WEDNESDAY),
        cart("tuesday", TUESDAY),
      ],
      undefined,
    )

    expect(saved.map((c) => c.id)).toEqual(["tuesday", "monday"])
  })

  test("an account with one cart has nothing saved", () => {
    expect(savedCartsOf([cart("only", MONDAY)], undefined)).toEqual([])
  })

  test("an account with no carts has nothing saved", () => {
    expect(savedCartsOf([], undefined)).toEqual([])
  })

  test("an account that holds only quotes has nothing saved", () => {
    expect(
      savedCartsOf([cart("quote", MONDAY, { isQuote: true })], undefined),
    ).toEqual([])
  })
})

function fakePort(carts: ListedCart[], views: Record<string, CartView>) {
  const reads: string[] = []

  const port: CartsPort = {
    async listCarts() {
      return carts
    },
    async createCart() {
      throw new Error("not used")
    },
    async renameCart() {
      throw new Error("not used")
    },
    async addProduct() {
      throw new Error("not used")
    },
    async readCart(cartId) {
      reads.push(cartId)
      return views[cartId]!
    },
  }

  return { port, reads }
}

const view = (itemCount: number, total: string): CartView => ({
  lines: [],
  itemCount,
  total,
})

describe("listSavedCarts", () => {
  test("shows each saved cart's name, item count, total and expiry", async () => {
    const { port } = fakePort(
      [
        cart("active", WEDNESDAY),
        cart("monday", MONDAY, {
          name: "Weekly order",
          expiresAt: "2026-10-12T09:00:00.000Z",
        }),
      ],
      { monday: view(3, "$30.00") },
    )

    expect(await listSavedCarts(port, undefined)).toEqual([
      {
        handle: cartHandle("monday"),
        name: "Weekly order",
        itemCount: 3,
        total: "$30.00",
        expiresAt: "2026-10-12T09:00:00.000Z",
      },
    ])
  })

  test("reads only the saved carts, never the active cart or a quote", async () => {
    const { port, reads } = fakePort(
      [
        cart("active", WEDNESDAY),
        cart("quote", TUESDAY, { isQuote: true }),
        cart("monday", MONDAY),
      ],
      { monday: view(1, "$5.00") },
    )

    await listSavedCarts(port, undefined)

    expect(reads).toEqual(["monday"])
  })

  test("names a cart that has no name", async () => {
    const { port } = fakePort(
      [cart("active", WEDNESDAY), cart("monday", MONDAY, { name: undefined })],
      { monday: view(0, "$0.00") },
    )

    const [saved] = await listSavedCarts(port, undefined)

    expect(saved?.name).toBe(UNNAMED_CART)
  })

  test("never puts a cart id in what the page is given", async () => {
    const { port } = fakePort(
      [
        cart("active", WEDNESDAY),
        cart("secret-cart-id", MONDAY, { name: "Weekly order" }),
      ],
      { "secret-cart-id": view(1, "$5.00") },
    )

    const saved = await listSavedCarts(port, undefined)

    expect(JSON.stringify(saved)).not.toContain("secret-cart-id")
  })

  test("fails when a saved cart cannot be read, rather than listing it as empty", async () => {
    const { port } = fakePort(
      [cart("active", WEDNESDAY), cart("monday", MONDAY)],
      {},
    )
    port.readCart = async () => {
      throw new Error("Elastic Path unavailable")
    }

    await expect(listSavedCarts(port, undefined)).rejects.toThrow(
      "Elastic Path unavailable",
    )
  })
})

describe("cartHandle", () => {
  test("is the same for the same cart every time", () => {
    expect(cartHandle("cart-1")).toBe(cartHandle("cart-1"))
  })

  test("differs between carts", () => {
    expect(cartHandle("cart-1")).not.toBe(cartHandle("cart-2"))
  })

  test("does not contain the cart id and is safe to put in a form field", () => {
    const handle = cartHandle("0f8fad5b-d9cb-469f-a165-70867728950e")

    expect(handle).not.toContain("0f8fad5b")
    expect(handle).toMatch(/^[A-Za-z0-9_-]{22}$/)
  })
})

describe("resolveCartHandle", () => {
  test("finds the cart a handle was made from", () => {
    const carts = [{ id: "cart-1" }, { id: "cart-2" }]

    expect(resolveCartHandle(carts, cartHandle("cart-2"))).toBe("cart-2")
  })

  test("finds nothing for a cart the account does not hold", () => {
    expect(
      resolveCartHandle([{ id: "cart-1" }], cartHandle("someone-elses")),
    ).toBeUndefined()
  })

  test("finds nothing for a handle that was made up", () => {
    expect(resolveCartHandle([{ id: "cart-1" }], "nonsense")).toBeUndefined()
  })
})

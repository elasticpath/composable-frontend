import { describe, expect, test } from "vitest"
import type { CartCandidate } from "./active-cart"
import {
  addToActiveCart,
  readActiveCart,
  type CartView,
  type CartsPort,
} from "./cart-service"

const MONDAY = "2026-10-05T09:00:00.000Z"
const WEDNESDAY = "2026-10-07T09:00:00.000Z"

function fakePort(carts: CartCandidate[] = []) {
  const calls: string[] = []
  const added: { cartId: string; productId: string }[] = []

  const port: CartsPort = {
    async listCarts() {
      calls.push("listCarts")
      return carts
    },
    async createCart() {
      calls.push("createCart")
      carts.push({ id: "created", updatedAt: WEDNESDAY, isQuote: false })
      return "created"
    },
    async addProduct(cartId, productId) {
      calls.push("addProduct")
      added.push({ cartId, productId })
    },
    async readCart(cartId): Promise<CartView> {
      calls.push(`readCart:${cartId}`)
      return {
        lines: [
          { id: "line-1", name: "Mug", quantity: 2, lineTotal: "$20.00" },
        ],
        itemCount: 2,
        total: "$20.00",
      }
    },
  }

  return { port, calls, added }
}

describe("addToActiveCart", () => {
  test("adds to the most recently updated cart the account holds", async () => {
    const { port, added } = fakePort([
      { id: "monday", updatedAt: MONDAY, isQuote: false },
      { id: "wednesday", updatedAt: WEDNESDAY, isQuote: false },
    ])

    const cartId = await addToActiveCart(port, undefined, "mug")

    expect(cartId).toBe("wednesday")
    expect(added).toEqual([{ cartId: "wednesday", productId: "mug" }])
  })

  test("adds to the cookie's cart when the account still holds it", async () => {
    const { port, added } = fakePort([
      { id: "monday", updatedAt: MONDAY, isQuote: false },
      { id: "wednesday", updatedAt: WEDNESDAY, isQuote: false },
    ])

    await addToActiveCart(port, "monday", "mug")

    expect(added).toEqual([{ cartId: "monday", productId: "mug" }])
  })

  test("creates a cart when the account has none, and adds to it", async () => {
    const { port, calls, added } = fakePort([])

    const cartId = await addToActiveCart(port, undefined, "mug")

    expect(cartId).toBe("created")
    expect(calls).toEqual(["listCarts", "createCart", "addProduct"])
    expect(added).toEqual([{ cartId: "created", productId: "mug" }])
  })

  test("creates a cart when the account only holds quotes", async () => {
    const { port, added } = fakePort([
      { id: "quote", updatedAt: WEDNESDAY, isQuote: true },
    ])

    await addToActiveCart(port, undefined, "mug")

    expect(added).toEqual([{ cartId: "created", productId: "mug" }])
  })

  test("creates nothing when the account already holds a cart", async () => {
    const { port, calls } = fakePort([
      { id: "mine", updatedAt: MONDAY, isQuote: false },
    ])

    await addToActiveCart(port, undefined, "mug")

    expect(calls).not.toContain("createCart")
  })

  test("does not add anything when the cart list cannot be read", async () => {
    const { port, added } = fakePort()
    port.listCarts = async () => {
      throw new Error("Elastic Path unavailable")
    }

    await expect(addToActiveCart(port, undefined, "mug")).rejects.toThrow(
      "Elastic Path unavailable",
    )
    expect(added).toEqual([])
  })

  test("does not add anything when creating the cart fails", async () => {
    const { port, added } = fakePort()
    port.createCart = async () => {
      throw new Error("could not create")
    }

    await expect(addToActiveCart(port, undefined, "mug")).rejects.toThrow(
      "could not create",
    )
    expect(added).toEqual([])
  })
})

describe("readActiveCart", () => {
  test("reads the account's most recently updated cart", async () => {
    const { port, calls } = fakePort([
      { id: "monday", updatedAt: MONDAY, isQuote: false },
      { id: "wednesday", updatedAt: WEDNESDAY, isQuote: false },
    ])

    const view = await readActiveCart(port, undefined)

    expect(calls).toContain("readCart:wednesday")
    expect(view?.itemCount).toBe(2)
  })

  test("returns nothing, and creates nothing, when the account has no cart", async () => {
    const { port, calls } = fakePort([])

    expect(await readActiveCart(port, undefined)).toBeNull()
    expect(calls).toEqual(["listCarts"])
  })

  test("never reads a cart the account does not hold, whatever the cookie says", async () => {
    const { port, calls } = fakePort([
      { id: "mine", updatedAt: MONDAY, isQuote: false },
    ])

    await readActiveCart(port, "someone-elses")

    expect(calls).toEqual(["listCarts", "readCart:mine"])
  })
})

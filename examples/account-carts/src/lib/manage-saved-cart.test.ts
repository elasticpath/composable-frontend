import { describe, expect, test } from "vitest"
import type { CartView, CartsPort, ListedCart } from "./cart-service"
import {
  deleteSavedCart,
  renameSavedCart,
  resumeSavedCart,
} from "./manage-saved-cart"
import { cartHandle } from "./saved-carts"

const EARLIER = "2026-10-05T09:00:00.000Z"
const LATER = "2026-10-07T09:00:00.000Z"

type CartFixture = Pick<ListedCart, "id"> & Partial<ListedCart>

function listed(cart: CartFixture): ListedCart {
  return {
    name: undefined,
    expiresAt: undefined,
    updatedAt: EARLIER,
    isQuote: false,
    ...cart,
  }
}

function fakePort(fixtures: CartFixture[]) {
  const carts = fixtures.map(listed)
  const calls: string[] = []

  const port: CartsPort = {
    async listCarts() {
      calls.push("listCarts")
      return carts
    },
    async createCart() {
      calls.push("createCart")
      return "fresh"
    },
    async renameCart(cartId, name) {
      calls.push(`renameCart:${cartId}:${name}`)
    },
    async deleteCart(cartId) {
      calls.push(`deleteCart:${cartId}`)
    },
    async disassociateCart(cartId) {
      calls.push(`disassociateCart:${cartId}`)
    },
    async mergeCart() {
      throw new Error("not used")
    },
    async addProduct() {
      calls.push("addProduct")
    },
    async readCart(): Promise<CartView> {
      calls.push("readCart")
      return { lines: [], itemCount: 0, total: undefined }
    },
  }

  return { port, calls }
}

describe("renameSavedCart", () => {
  test("renames the cart the handle names, under the trimmed name", async () => {
    const { port, calls } = fakePort([{ id: "active" }, { id: "saved" }])

    const result = await renameSavedCart(
      port,
      cartHandle("saved"),
      "  Weekly order ",
    )

    expect(result).toEqual({ status: "renamed", name: "Weekly order" })
    expect(calls).toContain("renameCart:saved:Weekly order")
  })

  test("touches nothing when the name is not usable", async () => {
    const { port, calls } = fakePort([{ id: "saved" }])

    const result = await renameSavedCart(port, cartHandle("saved"), "   ")

    expect(result.status).toBe("invalid-name")
    expect(calls).toEqual([])
  })

  test("renames nothing when the handle names no cart the account holds", async () => {
    const { port, calls } = fakePort([{ id: "saved" }])

    const result = await renameSavedCart(
      port,
      cartHandle("someone-elses"),
      "Weekly order",
    )

    expect(result).toEqual({ status: "not-found" })
    expect(calls.some((call) => call.startsWith("renameCart"))).toBe(false)
  })

  test("renames nothing for a quote", async () => {
    const { port, calls } = fakePort([{ id: "quote", isQuote: true }])

    const result = await renameSavedCart(port, cartHandle("quote"), "Mine")

    expect(result).toEqual({ status: "not-found" })
    expect(calls.some((call) => call.startsWith("renameCart"))).toBe(false)
  })
})

describe("deleteSavedCart", () => {
  test("deletes the cart the handle names and nothing else", async () => {
    const { port, calls } = fakePort([{ id: "active" }, { id: "saved" }])

    const result = await deleteSavedCart(port, cartHandle("saved"))

    expect(result).toEqual({ status: "deleted", activeCartId: undefined })
    expect(calls).toEqual(["listCarts", "deleteCart:saved"])
  })

  test("disassociates, deletes, then creates a cart when it is the account's last", async () => {
    const { port, calls } = fakePort([{ id: "only" }])

    const result = await deleteSavedCart(port, cartHandle("only"))

    expect(result).toEqual({ status: "deleted", activeCartId: "fresh" })
    expect(calls).toEqual([
      "listCarts",
      "disassociateCart:only",
      "deleteCart:only",
      "createCart",
    ])
  })

  test("creates a cart after deleting the only cart that is not a quote", async () => {
    const { port, calls } = fakePort([
      { id: "quote", isQuote: true },
      { id: "only" },
    ])

    const result = await deleteSavedCart(port, cartHandle("only"))

    expect(result).toEqual({ status: "deleted", activeCartId: "fresh" })
    expect(calls).toEqual(["listCarts", "deleteCart:only", "createCart"])
  })

  test("deletes nothing when the handle names no cart the account holds", async () => {
    const { port, calls } = fakePort([{ id: "saved" }])

    const result = await deleteSavedCart(port, cartHandle("someone-elses"))

    expect(result).toEqual({ status: "not-found" })
    expect(calls).toEqual(["listCarts"])
  })

  test("deletes nothing for a quote", async () => {
    const { port, calls } = fakePort([{ id: "quote", isQuote: true }])

    const result = await deleteSavedCart(port, cartHandle("quote"))

    expect(result).toEqual({ status: "not-found" })
    expect(calls).toEqual(["listCarts"])
  })

  test("creates no new cart when the delete fails", async () => {
    const { port, calls } = fakePort([{ id: "only" }])
    port.deleteCart = async () => {
      throw new Error("delete refused")
    }

    await expect(deleteSavedCart(port, cartHandle("only"))).rejects.toThrow(
      "delete refused",
    )
    expect(calls).not.toContain("createCart")
  })

  test("deletes nothing when the disassociation fails", async () => {
    const { port, calls } = fakePort([{ id: "only" }])
    port.disassociateCart = async () => {
      throw new Error("disassociate refused")
    }

    await expect(deleteSavedCart(port, cartHandle("only"))).rejects.toThrow(
      "disassociate refused",
    )
    expect(calls.some((call) => call.startsWith("deleteCart"))).toBe(false)
  })
})

describe("resumeSavedCart", () => {
  test("returns the id of the cart the handle names, changing nothing in the account", async () => {
    const { port, calls } = fakePort([
      { id: "active", updatedAt: LATER },
      { id: "saved" },
    ])

    const result = await resumeSavedCart(port, cartHandle("saved"))

    expect(result).toEqual({ status: "resumed", cartId: "saved" })
    expect(calls).toEqual(["listCarts"])
  })

  test("resumes nothing when the handle names no cart the account holds", async () => {
    const { port } = fakePort([{ id: "saved" }])

    expect(await resumeSavedCart(port, cartHandle("someone-elses"))).toEqual({
      status: "not-found",
    })
  })

  test("resumes nothing for a quote", async () => {
    const { port } = fakePort([{ id: "quote", isQuote: true }])

    expect(await resumeSavedCart(port, cartHandle("quote"))).toEqual({
      status: "not-found",
    })
  })
})

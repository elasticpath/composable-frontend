import { describe, expect, test } from "vitest"
import type { CartView, CartsPort, ListedCart } from "./cart-service"
import { saveForLater } from "./save-for-later"

const MONDAY = "2026-10-05T09:00:00.000Z"
const WEDNESDAY = "2026-10-07T09:00:00.000Z"

const cart = (id: string, updatedAt: string, isQuote = false): ListedCart => ({
  id,
  name: undefined,
  updatedAt,
  expiresAt: undefined,
  isQuote,
})

const withMug: CartView = {
  lines: [{ id: "line-1", name: "Mug", quantity: 2, lineTotal: "$20.00" }],
  itemCount: 2,
  total: "$20.00",
}

const empty: CartView = { lines: [], itemCount: 0, total: undefined }

function fakePort({
  carts = [cart("monday", MONDAY), cart("wednesday", WEDNESDAY)],
  view = withMug,
}: { carts?: ListedCart[]; view?: CartView } = {}) {
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
    async readCart(cartId) {
      calls.push(`readCart:${cartId}`)
      return view
    },
  }

  return { port, calls }
}

describe("saveForLater", () => {
  test("renames the active cart, then creates the new empty cart and makes it active", async () => {
    const { port, calls } = fakePort()

    const result = await saveForLater(port, undefined, "Weekly order")

    expect(result).toEqual({
      status: "saved",
      name: "Weekly order",
      activeCartId: "fresh",
    })
    expect(calls).toEqual([
      "listCarts",
      "readCart:wednesday",
      "renameCart:wednesday:Weekly order",
      "createCart",
    ])
  })

  test("saves the cart the cookie names, not the most recent one", async () => {
    const { port, calls } = fakePort()

    await saveForLater(port, "monday", "Weekly order")

    expect(calls).toContain("renameCart:monday:Weekly order")
  })

  test("saves under the trimmed name", async () => {
    const { port, calls } = fakePort()

    await saveForLater(port, undefined, "  Weekly order ")

    expect(calls).toContain("renameCart:wednesday:Weekly order")
  })

  test("touches nothing when the name is not usable", async () => {
    const { port, calls } = fakePort()

    const result = await saveForLater(port, undefined, "   ")

    expect(result).toMatchObject({ status: "invalid-name" })
    expect(calls).toEqual([])
  })

  test("saves nothing when the active cart is empty", async () => {
    const { port, calls } = fakePort({ view: empty })

    const result = await saveForLater(port, undefined, "Weekly order")

    expect(result).toEqual({ status: "nothing-to-save" })
    expect(calls).not.toContain("createCart")
    expect(calls.some((call) => call.startsWith("renameCart"))).toBe(false)
  })

  test("saves nothing, and creates nothing, when the account holds no cart", async () => {
    const { port, calls } = fakePort({ carts: [] })

    const result = await saveForLater(port, undefined, "Weekly order")

    expect(result).toEqual({ status: "nothing-to-save" })
    expect(calls).toEqual(["listCarts"])
  })

  test("never saves a quote", async () => {
    const { port, calls } = fakePort({
      carts: [cart("quote", WEDNESDAY, true)],
    })

    const result = await saveForLater(port, "quote", "Weekly order")

    expect(result).toEqual({ status: "nothing-to-save" })
    expect(calls).toEqual(["listCarts"])
  })

  test("creates no new cart when the rename fails", async () => {
    const { port, calls } = fakePort()
    port.renameCart = async () => {
      throw new Error("rename refused")
    }

    await expect(saveForLater(port, undefined, "Weekly order")).rejects.toThrow(
      "rename refused",
    )
    expect(calls).not.toContain("createCart")
  })

  test("reports the failure when the new cart cannot be created", async () => {
    const { port } = fakePort()
    port.createCart = async () => {
      throw new Error("create refused")
    }

    await expect(saveForLater(port, undefined, "Weekly order")).rejects.toThrow(
      "create refused",
    )
  })
})

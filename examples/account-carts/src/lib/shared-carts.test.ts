import { describe, expect, test } from "vitest"
import type { CartsPort, ListedCart } from "./cart-service"
import { UNNAMED_CART, cartHandle } from "./saved-carts"
import { listShareLinks, shareSavedCart } from "./shared-carts"
import type { ShareEntry, ShareStore } from "./shares"

const ALICE = "11111111-1111-1111-1111-111111111111"
const BOB = "22222222-2222-2222-2222-222222222222"
const TOKEN_A = "A".repeat(43)
const TOKEN_B = "B".repeat(43)
const MONDAY = "2026-10-05T09:00:00.000Z"
const WEDNESDAY = "2026-10-07T09:00:00.000Z"

const cart = (
  id: string,
  updatedAt: string,
  overrides: Partial<ListedCart> = {},
): ListedCart => ({
  id,
  name: id,
  updatedAt,
  expiresAt: undefined,
  isQuote: false,
  ...overrides,
})

const portHolding = (carts: ListedCart[]): CartsPort => ({
  async listCarts() {
    return carts
  },
  async createCart() {
    throw new Error("not used")
  },
  async renameCart() {
    throw new Error("not used")
  },
  async deleteCart() {
    throw new Error("not used")
  },
  async disassociateCart() {
    throw new Error("not used")
  },
  async addProduct() {
    throw new Error("not used")
  },
  async readCart() {
    throw new Error("not used")
  },
})

function memoryStore(seed: ShareEntry[] = []) {
  const entries = [...seed]
  const store: ShareStore = {
    async list(filter) {
      const match = /^eq\(account_id,(.*)\)$/.exec(filter)
      return match ? entries.filter((e) => e.account_id === match[1]) : entries
    },
    async get(id) {
      return entries.find((e) => e.id === id) ?? null
    },
    async create(values) {
      const created = { id: `entry-${entries.length + 1}`, ...values }
      entries.push(created)
      return created
    },
    async remove(id) {
      entries.splice(
        entries.findIndex((e) => e.id === id),
        1,
      )
    },
  }
  return { store, entries }
}

const share = (overrides: Partial<ShareEntry> = {}): ShareEntry => ({
  id: "s1",
  share_token: TOKEN_A,
  cart_id: "saved",
  account_id: ALICE,
  shared_at: MONDAY,
  ...overrides,
})

describe("shareSavedCart", () => {
  test("shares the saved cart a handle names, as the signed-in account", async () => {
    const port = portHolding([cart("saved", MONDAY), cart("active", WEDNESDAY)])
    const { store, entries } = memoryStore()

    const result = await shareSavedCart(port, store, {
      accountId: ALICE,
      cookieCartId: undefined,
      handle: cartHandle("saved"),
      newToken: () => TOKEN_A,
    })

    expect(result).toMatchObject({
      status: "shared",
      share: { share_token: TOKEN_A },
    })
    expect(entries).toMatchObject([
      { cart_id: "saved", account_id: ALICE, share_token: TOKEN_A },
    ])
  })

  test("finds nothing for a handle that is not one of the account's saved carts", async () => {
    const port = portHolding([cart("saved", MONDAY), cart("active", WEDNESDAY)])
    const { store, entries } = memoryStore()

    const result = await shareSavedCart(port, store, {
      accountId: ALICE,
      cookieCartId: undefined,
      handle: cartHandle("someone-elses-cart"),
    })

    expect(result).toEqual({ status: "not-found" })
    expect(entries).toEqual([])
  })

  test("does not share the active cart or a quote", async () => {
    const port = portHolding([
      cart("saved", MONDAY),
      cart("quote", MONDAY, { isQuote: true }),
      cart("active", WEDNESDAY),
    ])
    const { store, entries } = memoryStore()

    for (const id of ["active", "quote"]) {
      const result = await shareSavedCart(port, store, {
        accountId: ALICE,
        cookieCartId: undefined,
        handle: cartHandle(id),
      })
      expect(result).toEqual({ status: "not-found" })
    }
    expect(entries).toEqual([])
  })
})

describe("listShareLinks", () => {
  test("shows each share with the name of the cart it points to", async () => {
    const port = portHolding([
      cart("saved", MONDAY, { name: "Spring order" }),
      cart("other", MONDAY, { name: undefined }),
    ])
    const { store } = memoryStore([
      share({ id: "s1", cart_id: "saved" }),
      share({ id: "s2", cart_id: "other", share_token: TOKEN_B }),
    ])

    const links = await listShareLinks(port, store, ALICE)

    expect(links).toEqual([
      { id: "s1", token: TOKEN_A, cartName: "Spring order", sharedAt: MONDAY },
      { id: "s2", token: TOKEN_B, cartName: UNNAMED_CART, sharedAt: MONDAY },
    ])
  })

  test("marks a share whose cart the account no longer holds", async () => {
    const port = portHolding([])
    const { store } = memoryStore([share({ cart_id: "gone" })])

    const links = await listShareLinks(port, store, ALICE)

    expect(links).toEqual([
      { id: "s1", token: TOKEN_A, cartName: undefined, sharedAt: MONDAY },
    ])
  })

  test("never shows another account's share, and never carries a cart id", async () => {
    const port = portHolding([cart("saved", MONDAY, { name: "Spring order" })])
    const { store } = memoryStore([
      share({ id: "mine" }),
      share({ id: "theirs", account_id: BOB, share_token: TOKEN_B }),
    ])

    const links = await listShareLinks(port, store, ALICE)

    expect(links.map((link) => link.id)).toEqual(["mine"])
    expect(JSON.stringify(links)).not.toContain("saved")
  })
})

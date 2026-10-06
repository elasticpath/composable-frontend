import { describe, expect, test } from "vitest"
import type { CartsPort, ListedCart } from "./cart-service"
import { CartsUnavailableError } from "./carts-port"
import { NOTHING_MERGED_MESSAGE } from "./messages"
import { acceptShare, openShare, type ShareSource } from "./open-share"
import type { SharedCart } from "./shared-cart"
import {
  createShare,
  findShareByToken,
  revokeShare,
  type ShareEntry,
  type ShareStore,
} from "./shares"

const EARLIER = "2026-10-05T09:00:00.000Z"
const LATER = "2026-10-07T09:00:00.000Z"
const SENDER = "sender-account"
const SENDERS_CART = "senders-cart"

const sharedCart: SharedCart = {
  lines: [
    {
      id: "item-mug",
      productId: "product-mug",
      name: "Mug",
      quantity: 2,
      lineTotal: "$20.00",
    },
  ],
  itemCount: 2,
  total: "$20.00",
}

function inMemoryShareStore() {
  const entries: ShareEntry[] = []
  let next = 0

  const store: ShareStore = {
    async list(filter) {
      const token = /^eq\(share_token,(.*)\)$/.exec(filter)?.[1]
      return entries.filter((entry) => entry.share_token === token)
    },
    async get(entryId) {
      return entries.find((entry) => entry.id === entryId) ?? null
    },
    async create(values) {
      const entry = { id: `entry-${++next}`, ...values }
      entries.push(entry)
      return entry
    },
    async remove(entryId) {
      entries.splice(
        entries.findIndex((entry) => entry.id === entryId),
        1,
      )
    },
  }

  return store
}

function sourceFor(
  store: ShareStore,
  carts: Record<string, SharedCart | null> = { [SENDERS_CART]: sharedCart },
) {
  const reads: string[] = []

  const source: ShareSource = {
    lookupShare: (token) => findShareByToken(store, token),
    async readSharedCart(cartId) {
      reads.push(cartId)
      return carts[cartId] ?? null
    },
  }

  return { source, reads }
}

async function sharedByTheSender(store: ShareStore) {
  const share = await createShare(store, {
    accountId: SENDER,
    cartId: SENDERS_CART,
  })
  return share.share_token
}

type CartFixture = Pick<ListedCart, "id"> & Partial<ListedCart>

function recipientPort(
  fixtures: CartFixture[],
  merge: CartsPort["mergeCart"] = async () => {},
) {
  const carts: ListedCart[] = fixtures.map((cart) => ({
    name: undefined,
    expiresAt: undefined,
    updatedAt: EARLIER,
    isQuote: false,
    ...cart,
  }))
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
    async addProduct(cartId, productId) {
      calls.push(`addProduct:${cartId}:${productId}`)
    },
    async readCart(cartId) {
      calls.push(`readCart:${cartId}`)
      return { lines: [], itemCount: 0, total: undefined }
    },
    async mergeCart(targetCartId, sourceCartId) {
      calls.push(`mergeCart:${targetCartId}:${sourceCartId}`)
      await merge(targetCartId, sourceCartId)
    },
  }

  return { port, calls }
}

describe("openShare", () => {
  test("gives the shared cart's items for a token that names a live share", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)

    expect(await openShare(source, token)).toEqual({
      status: "available",
      cartId: SENDERS_CART,
      cart: sharedCart,
    })
  })

  test("answers the same for a token that was never issued, a malformed token, a revoked share and an expired cart", async () => {
    const store = inMemoryShareStore()

    const revokedToken = await sharedByTheSender(store)
    const revoked = await findShareByToken(store, revokedToken)
    await revokeShare(store, SENDER, revoked!.id)

    const expiredToken = await createShare(store, {
      accountId: SENDER,
      cartId: "expired-cart",
    }).then((share) => share.share_token)

    const { source } = sourceFor(store, {
      [SENDERS_CART]: sharedCart,
      "expired-cart": null,
    })

    const answers = await Promise.all([
      openShare(source, "A".repeat(43)),
      openShare(source, "not-a-token"),
      openShare(source, ""),
      openShare(source, revokedToken),
      openShare(source, expiredToken),
    ])

    for (const answer of answers) {
      expect(answer).toEqual({ status: "unavailable" })
    }
  })

  test("does not read the shared cart for a token that names no share", async () => {
    const { source, reads } = sourceFor(inMemoryShareStore())

    await openShare(source, "A".repeat(43))

    expect(reads).toEqual([])
  })

  test("lets an outage while reading the shared cart surface instead of reading as an unavailable link", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    source.readSharedCart = async () => {
      throw new CartsUnavailableError("reading the shared cart")
    }

    await expect(openShare(source, token)).rejects.toBeInstanceOf(
      CartsUnavailableError,
    )
  })
})

describe("acceptShare", () => {
  test("merges the shared cart into the recipient's active cart and names that cart", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    const { port, calls } = recipientPort([
      { id: "earlier", updatedAt: EARLIER },
      { id: "latest", updatedAt: LATER },
    ])

    const result = await acceptShare(port, source, {
      token,
      cookieCartId: undefined,
    })

    expect(result).toEqual({ status: "merged", cartId: "latest" })
    expect(calls).toContain(`mergeCart:latest:${SENDERS_CART}`)
  })

  test("merges into the cart the cookie names when the account still holds it", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    const { port, calls } = recipientPort([
      { id: "mine", updatedAt: EARLIER },
      { id: "latest", updatedAt: LATER },
    ])

    await acceptShare(port, source, { token, cookieCartId: "mine" })

    expect(calls).toContain(`mergeCart:mine:${SENDERS_CART}`)
  })

  test("creates a cart for a recipient who has none, then merges into it", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    const { port, calls } = recipientPort([])

    const result = await acceptShare(port, source, {
      token,
      cookieCartId: undefined,
    })

    expect(result).toEqual({ status: "merged", cartId: "fresh" })
    expect(calls).toEqual([
      "listCarts",
      "createCart",
      `mergeCart:fresh:${SENDERS_CART}`,
    ])
  })

  test("never merges into a quote", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    const { port, calls } = recipientPort([
      { id: "quote", updatedAt: LATER, isQuote: true },
      { id: "cart", updatedAt: EARLIER },
    ])

    await acceptShare(port, source, { token, cookieCartId: "quote" })

    expect(calls).toContain(`mergeCart:cart:${SENDERS_CART}`)
  })

  test("sends the recipient's port no write to the shared cart id", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    const { port, calls } = recipientPort([{ id: "mine" }])

    await acceptShare(port, source, { token, cookieCartId: "mine" })

    expect(calls).toEqual(["listCarts", `mergeCart:mine:${SENDERS_CART}`])
  })

  test("does not merge a cart into itself when the shared cart is the recipient's active cart", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    const { port, calls } = recipientPort([{ id: SENDERS_CART }])

    const result = await acceptShare(port, source, {
      token,
      cookieCartId: SENDERS_CART,
    })

    expect(result).toEqual({ status: "already-active", cartId: SENDERS_CART })
    expect(calls.some((call) => call.startsWith("mergeCart"))).toBe(false)
  })

  test("does nothing for an unavailable link", async () => {
    const { source } = sourceFor(inMemoryShareStore())
    const { port, calls } = recipientPort([])

    const result = await acceptShare(port, source, {
      token: "A".repeat(43),
      cookieCartId: undefined,
    })

    expect(result).toEqual({ status: "unavailable" })
    expect(calls).toEqual([])
  })

  test("names each refused product when the merge is refused, and says nothing was added", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    const { port } = recipientPort([{ id: "mine" }], async () => {
      throw new CartsUnavailableError("merging the shared cart", {
        cause: {
          errors: [
            {
              status: 400,
              title: "Insufficient stock",
              meta: { id: "product-mug" },
            },
          ],
        },
      })
    })

    const result = await acceptShare(port, source, {
      token,
      cookieCartId: "mine",
    })

    expect(result).toEqual({
      status: "failed",
      cartId: "mine",
      failure: {
        summary: NOTHING_MERGED_MESSAGE,
        problems: ["Mug: not enough stock"],
      },
    })
  })

  test("keeps the cart it created active when the merge into it is refused", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    const { port } = recipientPort([], async () => {
      throw new CartsUnavailableError("merging the shared cart", {
        cause: { errors: [{ status: 404, title: "Product not found" }] },
      })
    })

    const result = await acceptShare(port, source, {
      token,
      cookieCartId: undefined,
    })

    expect(result).toMatchObject({ status: "failed", cartId: "fresh" })
  })

  test("lets a failure that is not from Elastic Path surface", async () => {
    const store = inMemoryShareStore()
    const token = await sharedByTheSender(store)
    const { source } = sourceFor(store)
    const { port } = recipientPort([{ id: "mine" }], async () => {
      throw new Error("boom")
    })

    await expect(
      acceptShare(port, source, { token, cookieCartId: "mine" }),
    ).rejects.toThrow("boom")
  })
})

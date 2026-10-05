import {
  createACart,
  createAccountCartAssociation,
  createClient,
  getACart,
  getCarts,
  manageCarts,
} from "@epcc-sdk/sdks-shopper"
import type { CartCandidate } from "./active-cart"
import type { CartsPort } from "./cart-service"
import { toCartCandidate, toCartView } from "./cart-view"

export const CART_NAME = "Cart"
export const QUANTITY_PER_ADD = 1
export const CARTS_PAGE_SIZE = 100
export const MAX_CART_PAGES = 20

export class CartsUnavailableError extends Error {
  constructor(action: string, options?: ErrorOptions) {
    super(`Elastic Path did not complete: ${action}`, options)
    this.name = "CartsUnavailableError"
  }
}

export type CartsSdk = {
  getCarts: typeof getCarts
  createACart: typeof createACart
  createAccountCartAssociation: typeof createAccountCartAssociation
  getACart: typeof getACart
  manageCarts: typeof manageCarts
}

export const liveCartsSdk: CartsSdk = {
  getCarts,
  createACart,
  createAccountCartAssociation,
  getACart,
  manageCarts,
}

type Outcome = { error?: unknown }

async function completed<T extends Outcome>(
  action: string,
  request: () => Promise<T>,
): Promise<T> {
  let response: T
  try {
    response = await request()
  } catch (cause) {
    throw new CartsUnavailableError(action, { cause })
  }

  if (response.error) {
    throw new CartsUnavailableError(action, { cause: response.error })
  }

  return response
}

export function createCartsPort({
  accountId,
  accountToken,
  implicitToken,
  sdk = liveCartsSdk,
}: {
  accountId: string
  accountToken: string
  implicitToken: () => Promise<string>
  sdk?: CartsSdk
}): CartsPort {
  const client = createClient({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
  })

  async function headers() {
    return {
      Authorization: `Bearer ${await implicitToken()}`,
      "EP-Account-Management-Authentication-Token": accountToken,
    }
  }

  return {
    async listCarts() {
      const candidates: CartCandidate[] = []

      for (let page = 0; page < MAX_CART_PAGES; page++) {
        const offset = page * CARTS_PAGE_SIZE
        const response = await completed(
          "listing the account's carts",
          async () =>
            sdk.getCarts({
              client,
              headers: await headers(),
              query: { "page[limit]": CARTS_PAGE_SIZE, "page[offset]": offset },
            }),
        )

        const carts = response.data?.data ?? []
        for (const cart of carts) {
          const candidate = toCartCandidate(cart)
          if (candidate) candidates.push(candidate)
        }

        const total = response.data?.meta?.results?.total
        const reachedEnd =
          carts.length === 0 ||
          (total !== undefined && offset + carts.length >= total)
        if (reachedEnd) break
      }

      return candidates
    },

    async createCart() {
      const created = await completed("creating a cart", async () =>
        sdk.createACart({
          client,
          headers: await headers(),
          body: { data: { name: CART_NAME } },
        }),
      )

      const cartId = created.data?.data?.id
      if (!cartId) {
        throw new CartsUnavailableError("creating a cart")
      }

      await completed("associating the cart with the account", async () =>
        sdk.createAccountCartAssociation({
          client,
          headers: await headers(),
          path: { cartID: cartId },
          body: { data: [{ type: "account", id: accountId }] },
        }),
      )

      return cartId
    },

    async addProduct(cartId, productId) {
      await completed("adding the product to the cart", async () =>
        sdk.manageCarts({
          client,
          headers: await headers(),
          path: { cartID: cartId },
          body: {
            data: {
              type: "cart_item",
              id: productId,
              quantity: QUANTITY_PER_ADD,
            },
          },
        }),
      )
    },

    async readCart(cartId) {
      const response = await completed("reading the cart", async () =>
        sdk.getACart({
          client,
          headers: await headers(),
          path: { cartID: cartId },
          query: { include: ["items"] },
        }),
      )

      if (!response.data) {
        throw new CartsUnavailableError("reading the cart")
      }

      return toCartView(response.data)
    },
  }
}

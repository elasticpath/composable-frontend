import {
  createACart,
  createAccountCartAssociation,
  deleteACart,
  deleteAccountCartAssociation,
  getACart,
  getCarts,
  manageCarts,
  updateACart,
} from "@epcc-sdk/sdks-shopper"
import type { CartsPort, ListedCart } from "./cart-service"
import {
  associateCartRequest,
  cartHeaders,
  createCartRequest,
  deleteCartRequest,
  disassociateCartRequest,
  mergeCartRequest,
  renameCartRequest,
} from "./cart-requests"
import { toListedCart, toCartView } from "./cart-view"
import { createStoreClient } from "./store-client"

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
  updateACart: typeof updateACart
  getACart: typeof getACart
  manageCarts: typeof manageCarts
  deleteACart: typeof deleteACart
  deleteAccountCartAssociation: typeof deleteAccountCartAssociation
}

export const liveCartsSdk: CartsSdk = {
  getCarts,
  createACart,
  createAccountCartAssociation,
  updateACart,
  getACart,
  manageCarts,
  deleteACart,
  deleteAccountCartAssociation,
}

type SdkResponse = { error?: unknown }

async function requireSuccess<T extends SdkResponse>(
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
  const client = createStoreClient()

  async function headers() {
    return cartHeaders({ implicitToken: await implicitToken(), accountToken })
  }

  return {
    async listCarts() {
      const listed: ListedCart[] = []

      for (let page = 0; page < MAX_CART_PAGES; page++) {
        const offset = page * CARTS_PAGE_SIZE
        const response = await requireSuccess(
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
          const listedCart = toListedCart(cart)
          if (listedCart) listed.push(listedCart)
        }

        const total = response.data?.meta?.results?.total
        const reachedEnd =
          carts.length === 0 ||
          (total !== undefined && offset + carts.length >= total)
        if (reachedEnd) break
      }

      return listed
    },

    async createCart() {
      const created = await requireSuccess("creating a cart", async () =>
        sdk.createACart({
          client,
          ...createCartRequest({ headers: await headers() }),
        }),
      )

      const cartId = created.data?.data?.id
      if (!cartId) {
        throw new CartsUnavailableError("creating a cart")
      }

      await requireSuccess("associating the cart with the account", async () =>
        sdk.createAccountCartAssociation({
          client,
          ...associateCartRequest({
            headers: await headers(),
            cartId,
            accountId,
          }),
        }),
      )

      return cartId
    },

    async renameCart(cartId, name) {
      await requireSuccess("renaming the cart", async () =>
        sdk.updateACart({
          client,
          ...renameCartRequest({ headers: await headers(), cartId, name }),
        }),
      )
    },

    async deleteCart(cartId) {
      await requireSuccess("deleting the cart", async () =>
        sdk.deleteACart({
          client,
          ...deleteCartRequest({ headers: await headers(), cartId }),
        }),
      )
    },

    async disassociateCart(cartId) {
      await requireSuccess("removing the cart from the account", async () =>
        sdk.deleteAccountCartAssociation({
          client,
          ...disassociateCartRequest({
            headers: await headers(),
            cartId,
            accountId,
          }),
        }),
      )
    },

    async mergeCart(targetCartId, sourceCartId) {
      await requireSuccess("merging the shared cart", async () =>
        sdk.manageCarts({
          client,
          ...mergeCartRequest({
            headers: await headers(),
            targetCartId,
            sourceCartId,
          }),
        }),
      )
    },

    async addProduct(cartId, productId) {
      await requireSuccess("adding the product to the cart", async () =>
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
      const response = await requireSuccess("reading the cart", async () =>
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

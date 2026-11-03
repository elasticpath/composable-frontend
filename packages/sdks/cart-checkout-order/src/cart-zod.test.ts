import { describe, expect, it, vi } from "vitest"
import {
  checkoutApi,
  createCartCheckoutOrderClient,
  manageCarts,
} from "./index"
import {
  zCheckoutApiBody,
  zCheckoutApiResponse,
  zGetCartItemsResponse,
  zManageCartsResponse,
} from "./zod"
import {
  accountCheckout,
  accountCheckoutWithTheAccountFromItsToken,
  addToCartResponse,
  cartItem,
  customItem,
  customerCheckout,
  orderWithACustomItem,
  promotionItem,
  subscriptionItem,
} from "./test/cart-fixtures"

const baseUrl = "https://useast.api.elasticpath.com"

const cartID = "c58ae8ac-d4c7-4d74-8c4a-4b2a7c8dbd3c"

function clientAnswering(response: unknown) {
  const transport = vi.fn(
    async () =>
      new Response(JSON.stringify(response), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
  ) as unknown as typeof fetch
  return createCartCheckoutOrderClient({
    baseUrl,
    token: "pre-issued",
    fetch: transport,
  })
}

async function addToCartThroughTheClient(response: unknown) {
  const { data } = await manageCarts({
    client: clientAnswering(response),
    path: { cartID },
    body: { data: { type: "cart_item", id: cartItem.product_id, quantity: 1 } },
  })
  return data
}

describe("zCheckoutApiBody", () => {
  it("keeps the account and contact of an account checkout", () => {
    expect(zCheckoutApiBody.parse(accountCheckout)).toEqual(accountCheckout)
  })

  it("keeps the contact of an account checkout that takes its account from the token", () => {
    expect(
      zCheckoutApiBody.parse(accountCheckoutWithTheAccountFromItsToken),
    ).toEqual(accountCheckoutWithTheAccountFromItsToken)
  })

  it("keeps the customer of a customer checkout", () => {
    expect(zCheckoutApiBody.parse(customerCheckout)).toEqual(customerCheckout)
  })
})

describe("zCheckoutApiResponse", () => {
  it("keeps an order item without a product id, as a custom item is ordered", async () => {
    const { data } = await checkoutApi({
      client: clientAnswering(orderWithACustomItem),
      path: { cartID },
      body: customerCheckout,
    })

    expect(zCheckoutApiResponse.parse(data)).toEqual(orderWithACustomItem)
  })
})

describe("zGetCartItemsResponse", () => {
  it("keeps every field of each kind of item in the cart", () => {
    const items = { data: addToCartResponse.data }

    expect(zGetCartItemsResponse.parse(items)).toEqual(items)
  })
})

describe("zManageCartsResponse", () => {
  it.each([
    ["cart_item", cartItem],
    ["custom_item", customItem],
    ["subscription_item", subscriptionItem],
    ["promotion_item", promotionItem],
  ])("keeps every field of a %s an add to cart returns", async (_, item) => {
    const response = { ...addToCartResponse, data: [item] }

    const data = await addToCartThroughTheClient(response)

    expect(zManageCartsResponse.parse(data)).toEqual(response)
  })

  it("keeps the shipping totals in the cart's display price", async () => {
    const data = await addToCartThroughTheClient(addToCartResponse)

    expect(zManageCartsResponse.parse(data).meta?.display_price).toEqual(
      addToCartResponse.meta.display_price,
    )
  })
})

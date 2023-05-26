import type { CartItemsResponse, Moltin as EPCCClient } from "@moltin/sdk"
import { Cart, CartIncluded, ResourceIncluded } from "@moltin/sdk"
import { SelectedOptions } from "@lib/cart/types/bundle.type"

export async function removeCartItem(
  id: string,
  itemId: string,
  client: EPCCClient
): Promise<CartItemsResponse> {
  return client.Cart(id).RemoveItem(itemId)
}

export async function removeAllCartItems(
  id: string,
  client: EPCCClient
): Promise<CartItemsResponse> {
  return client.Cart(id).RemoveAllItems()
}

export async function updateCartItem(
  id: string,
  productId: string,
  quantity: number,
  client: EPCCClient
): Promise<CartItemsResponse> {
  return client.Cart(id).UpdateItem(productId, quantity)
}

export async function addPromotion(
  id: string,
  promoCode: string,
  client: EPCCClient
): Promise<CartItemsResponse> {
  return client.Cart(id).AddPromotion(promoCode)
}

export async function addProductToCart(
  cartId: string,
  productId: string,
  quantity: number,
  client: EPCCClient
): Promise<CartItemsResponse> {
  return client.Cart(cartId).AddProduct(productId, quantity)
}

export async function addBundleProductToCart(
  cartId: string,
  productId: string,
  selectedOptions: SelectedOptions,
  quantity: number,
  client: EPCCClient
): Promise<CartItemsResponse> {
  return client.Cart(cartId).AddProduct(productId, quantity, {
    bundle_configuration: {
      selected_options: selectedOptions,
    },
  })
}

export interface CustomItemRequest {
  type: "custom_item"
  name: string
  quantity: number
  price: {
    amount: number
    includes_tax?: boolean
  }
  sku?: string
  description?: string
  custom_inputs?: Record<string, any>
}

export async function addCustomItemToCart(
  cartId: string,
  customItem: CustomItemRequest,
  client: EPCCClient
): Promise<CartItemsResponse> {
  return client.Cart(cartId).AddCustomItem(customItem)
}

export async function getCart(
  cartId: string,
  client: EPCCClient
): Promise<ResourceIncluded<Cart, CartIncluded>> {
  return client.Cart(cartId).With("items").Get()
}

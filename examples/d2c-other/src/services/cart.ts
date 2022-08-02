import type { CartItemsResponse } from "@moltin/sdk";
import { EPCCAPI } from "./helper";

export async function getCartItems(
  reference: string
): Promise<CartItemsResponse> {
  const CartItems = await EPCCAPI.Cart(reference).Items();
  return CartItems;
}

export async function removeCartItem(
  reference: string,
  itemId: string
): Promise<void> {
  await EPCCAPI.Cart(reference).RemoveItem(itemId);
}

export async function removeAllCartItems(reference: string): Promise<void> {
  await EPCCAPI.Cart(reference).RemoveAllItems();
}

export async function updateCartItem(
  reference: string,
  productId: string,
  quantity: number
): Promise<void> {
  await EPCCAPI.Cart(reference).UpdateItem(productId, quantity);
}

export async function addPromotion(
  reference: string,
  promoCode: string
): Promise<void> {
  await EPCCAPI.Cart(reference).AddPromotion(promoCode);
}

const createCartIdentifier = () => {
  return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  );
};

function setCartId() {
  localStorage.setItem("mcart", createCartIdentifier());
}

export const getCartId = (): string => {
  let cartId = localStorage.getItem("mcart");

  if (!cartId) {
    setCartId();
    cartId = localStorage.getItem("mcart");
  }

  return cartId || "";
};

export async function getMultiCarts(token: string) {
  const cartsList = await EPCCAPI.Cart().GetCartsList(token);
  return cartsList;
}

export async function addToCart(
  productId: string,
  quantity: number
): Promise<any> {
  const cartId: string = getCartId();

  const response = await EPCCAPI.Cart(cartId).AddProduct(productId, quantity);

  return response;
}

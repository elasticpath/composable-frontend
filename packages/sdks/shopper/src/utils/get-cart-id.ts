import { PERSISTED_CART_STORAGE_KEY } from "./initialize-cart"

export function getCartId() {
  return localStorage.getItem(PERSISTED_CART_STORAGE_KEY)
}

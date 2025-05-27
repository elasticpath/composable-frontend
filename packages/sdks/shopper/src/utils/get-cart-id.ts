import { PERSISTED_CART_STORAGE_KEY } from "./initialize-cart"

export function getCartId(options?: { storageKey?: string }) {
  return localStorage.getItem(options?.storageKey ?? PERSISTED_CART_STORAGE_KEY)
}

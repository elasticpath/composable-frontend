import { CartState, PresentCartState } from "../../cart"

export function getPresentCartState(
  state: CartState,
): PresentCartState | undefined {
  return state.kind === "present-cart-state"
    ? state
    : state.kind === "updating-cart-state" &&
      state.previousCart.kind === "present-cart-state"
    ? state.previousCart
    : undefined
}

export function getPresentCartStateCheckout(
  state: CartState,
): PresentCartState | undefined {
  return state.kind === "present-cart-state"
    ? state
    : state.kind === "updating-cart-state" &&
      state.updateAction === "checkout" &&
      state.previousCart.kind === "present-cart-state"
    ? state.previousCart
    : undefined
}

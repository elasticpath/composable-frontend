import { Cart } from "@moltin/sdk"
import {
  CartAction,
  CartState,
  CustomCartItem,
  PresentCartState,
  RegularCartItem,
} from "./types/cart-reducer-types"
import { groupCartItems } from "./util/group-cart-items"
import { isNonEmpty } from "@elasticpath/shopper-common"

export function calculateCartNumbers(
  meta?: Cart["meta"],
): Pick<PresentCartState, "withTax" | "withoutTax"> {
  const { without_tax, with_tax } = meta?.display_price ?? {}

  if (!with_tax?.formatted) {
    throw Error(
      "Unexpected value was undefined: display_price.with_tax.formatted can't calculate cart numbers.",
    )
  }

  if (!without_tax?.formatted) {
    throw Error(
      "Unexpected value was undefined: display_price.without_tax.formatted can't calculate cart numbers.",
    )
  }

  return {
    withTax: with_tax.formatted,
    withoutTax: without_tax.formatted,
  }
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "initialise-cart": {
      if (state.kind !== "uninitialised-cart-state") {
        return state
      }
      return {
        kind: "loading-cart-state",
      }
    }
    case "updating-cart": {
      if (
        state.kind === "present-cart-state" ||
        state.kind === "empty-cart-state"
      ) {
        return {
          kind: "updating-cart-state",
          previousCart: state,
          updateAction: action.payload.action,
        }
      }
      return state
    }
    case "failed-cart-update": {
      if (state.kind === "updating-cart-state") {
        return state.previousCart
      }
      return state
    }
    case "update-cart":
      if (
        state.kind !== "updating-cart-state" &&
        state.kind !== "loading-cart-state"
      ) {
        return state
      }
      const { id, meta, items } = action.payload

      if (!items || items.length < 1) {
        return {
          kind: "empty-cart-state",
          id,
        }
      }

      const filteredItems = items.filter(
        (item) => item.type === "cart_item" || item.type === "custom_item",
      ) as (RegularCartItem | CustomCartItem)[]

      if (!isNonEmpty(filteredItems)) {
        return {
          kind: "empty-cart-state",
          id,
        }
      }

      const groupedItems = groupCartItems(items)
      return {
        kind: "present-cart-state",
        groupedItems: groupedItems,
        id,
        items: filteredItems,
        ...calculateCartNumbers(meta),
      }
    default:
      return state
  }
}

import { Cart, CartItem } from "@moltin/sdk"
import { DeepReadonly } from "@elasticpath/shopper-common"

/** --------------------------------- Cart State --------------------------------- */

export type PromotionCartItem = DeepReadonly<CartItem> & {
  readonly type: "promotion_item"
}
export type CustomCartItem = DeepReadonly<CartItem> & {
  readonly type: "custom_item"
}
export type RegularCartItem = DeepReadonly<CartItem> & {
  readonly type: "cart_item"
}

/**
 * Cart items seperated into their respective groups by type property
 * cart_item, promotion_item and custom_item.
 */
export interface GroupedCartItems {
  /**
   * cart items of type cart_item
   */
  readonly regular: RegularCartItem[]

  /**
   * cart items of type promotion_item
   */
  readonly promotion: PromotionCartItem[]

  /**
   * cart items of type custom_item
   */
  readonly custom: CustomCartItem[]
}

export type RefinedCartItem = RegularCartItem | CustomCartItem

/**
 * State of the cart.
 */
export type CartState = {
  /**
   * items property is all items excluding promotion items
   */
  readonly items: ReadonlyArray<RefinedCartItem>

  /**
   * Extended cart properties
   */
  readonly __extended: {
    /**
     * Cart items grouped by their respective types cart_item, custom_item, promotion_item
     */
    readonly groupedItems: GroupedCartItems
  }
} & Cart

type UpdatingAction = "add" | "remove" | "update" | "empty" | "checkout"

/** --------------------------------- Cart Actions --------------------------------- */

/**
 * Update the cart with updated items and meta
 */
export interface UpdateCartAction {
  type: "update-cart"
  payload: {
    id: string
    meta: Cart["meta"]
    items?: CartItem[]
  }
}

/**
 * Let the cart know an update is being performed, it should be in an updating state.
 */
export interface UpdatingCartAction {
  type: "updating-cart"
  payload: {
    action: UpdatingAction
  }
}

/**
 * Let the cart know an update hase failed to be performed, it should be in a present state with the previous cart data.
 */
export interface FailedCartUpdateAction {
  type: "failed-cart-update"
}

/**
 * Let the cart know it's currently being initialed most likely when your
 * fetching the data client side for the first time
 */
export interface InitialiseCartAction {
  type: "initialise-cart"
}

/**
 * Actions that can be performed to change the state of the cart
 */
export type CartAction =
  | UpdateCartAction
  | UpdatingCartAction
  | FailedCartUpdateAction
  | InitialiseCartAction

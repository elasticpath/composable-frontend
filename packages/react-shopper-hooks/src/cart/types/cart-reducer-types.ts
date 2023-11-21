import { Cart, CartItem } from "@moltin/sdk"
import {
  DeepReadonly,
  ReadonlyNonEmptyArray,
} from "@elasticpath/shopper-common"

/** --------------------------------- Cart State --------------------------------- */

interface CartStateBase {}

export type PromotionCartItem = DeepReadonly<CartItem> & {
  readonly type: "promotion_item"
}
export type CustomCartItem = DeepReadonly<CartItem> & {
  readonly type: "custom_item"
}
export type RegularCartItem = DeepReadonly<CartItem> & {
  readonly type: "cart_item"
}

export interface LoadingCartState extends CartStateBase {
  readonly kind: "loading-cart-state"
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

/**
 * State the cart is in when there is no items in the cart
 */
export interface EmptyCartState extends CartStateBase {
  readonly kind: "empty-cart-state"

  /**
   * the cart id sometimes referred to as the reference
   */
  readonly id: string
}

/**
 * State the cart is in before it has fetched the cart data
 * this will happen if the provider is not given an initial cart state.
 */
export interface UninitialisedCartState extends CartStateBase {
  readonly kind: "uninitialised-cart-state"
}

export type RefinedCartItem = RegularCartItem | CustomCartItem

/**
 * State the cart is in when there are items in the cart. cart_item or custom_item
 *
 * promotion_items can't exist in a cart without any other cart items.
 */
export interface PresentCartState extends CartStateBase {
  readonly kind: "present-cart-state"

  /**
   * the cart id sometimes referred to as the reference
   */
  readonly id: string

  /**
   * items property is all items excluding promotion items
   */
  readonly items: ReadonlyNonEmptyArray<RefinedCartItem>

  /**
   * Cart items grouped by their respective types cart_item, custom_item, promotion_item
   */
  readonly groupedItems: GroupedCartItems

  /**
   * Total of the cart including tax
   */
  readonly withTax: string

  /**
   * Total of the cart without tax
   */
  readonly withoutTax: string
}

type UpdatingAction = "add" | "remove" | "update" | "empty" | "checkout"

/**
 * State the cart is in when there is an update actions in progress.
 */
export interface UpdatingCartState extends CartStateBase {
  readonly kind: "updating-cart-state"

  /**
   * State of the cart when the updating event was triggered.
   */
  readonly previousCart: PresentCartState | EmptyCartState

  /**
   * What type of update action is being performed during this update.
   */
  readonly updateAction: UpdatingAction
}

/**
 * Representing a state the cart can be in.
 */
export type CartState =
  | PresentCartState
  | LoadingCartState
  | UpdatingCartState
  | EmptyCartState
  | UninitialisedCartState

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

import { StoreError } from "../../shared"

/**
 * The scope of an event e.g. which area of the store it relates to.
 */
export type StoreScope = "cart" | "checkout"

/**
 * Actions that are connected to the cart scope
 */
export type StoreCartAction =
  | "add-to-cart"
  | "update-cart"
  | "remove-from-cart"
  | "empty-cart"
  | "init"

/**
 * All the action that can occur as part of a store event
 */
export type StoreAction = StoreCartAction

/**
 * Shared store event properties
 */
interface StoreEventBase {
  message: string
  scope: StoreScope
  action: StoreAction
}

/**
 * Event indicates that the store provider has been initialised
 */
export interface StoreInitEvent {
  type: "init"
}

/**
 * Success event indicates that an action has been performed successfully for a specific scope.
 * e.g. product has been added to cart
 */
export interface StoreSuccessEvent extends StoreEventBase {
  type: "success"
}

/**
 * Error event indicates that an error has occurred for an action that has been performed in a specific scope.
 * e.g. failed to add promotion to cart
 */
export interface StoreErrorEvent extends StoreEventBase {
  type: "error"
  cause: StoreError
}

/**
 * All the events that can occur on the event stream
 */
export type StoreEvent = StoreInitEvent | StoreSuccessEvent | StoreErrorEvent

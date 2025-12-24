interface StoreErrorBase {
  cause: Error;
}

/**
 * An error related to the cart has occurred
 */
export interface CartStoreError extends StoreErrorBase {
  type: "cart-store-error";
}

/**
 * An error related to the checkout process has occurred
 */
export interface CheckoutStoreError extends StoreErrorBase {
  type: "checkout-store-error";
}

/**
 * Errors that can happen within the store
 */
export type StoreError = CartStoreError | CheckoutStoreError;

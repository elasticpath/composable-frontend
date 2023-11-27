import { useContext } from "react"
import {
  addBundleProductToCart,
  addCustomItemToCart,
  addProductToCart,
  addPromotion,
  CustomItemRequest,
  removeAllCartItems,
  removeCartItem,
  updateCartItem,
} from "./service/cart"
import { CartItemsContext } from "./cart-provider"
import { CartAction, CartState } from "./types/cart-reducer-types"
import {
  CartItemsResponse,
  ConfirmPaymentResponse,
  Moltin as EPCCClient,
  Order,
  OrderBillingAddress,
  OrderShippingAddress,
  PaymentRequestBody,
} from "@moltin/sdk"
import { StoreCartAction, StoreEvent } from "../shared/types/event-types"
import { StoreError } from "../shared/types/error-types"
import { checkout, makePayment } from "../cart/service/checkout"
import { SelectedOptions } from "../cart/types/bundle.type"

export function useCart() {
  const context = useContext(CartItemsContext)

  if (context === undefined) {
    throw new Error("useCartItems must be used within a CartProvider")
  }

  const { state, dispatch, emit, resolveCartId, client } = context

  return {
    addProductToCart: _addProductToCart(client, dispatch, resolveCartId, emit),
    addBundleProductToCart: _addBundleProductToCart(
      client,
      dispatch,
      resolveCartId,
      emit,
    ),
    removeCartItem: _removeCartItem(client, dispatch, resolveCartId, emit),
    emptyCart: _emptyCart(client, dispatch, state, resolveCartId, emit),
    addPromotionToCart: _addPromotionToCart(
      client,
      dispatch,
      resolveCartId,
      emit,
    ),
    updateCartItem: _updateCartItem(client, dispatch, resolveCartId, emit),
    addCustomItemToCart: _addCustomItemToCart(
      client,
      dispatch,
      resolveCartId,
      emit,
    ),
    stripeIntent: _stripeIntent(dispatch, resolveCartId, client, emit),
    checkout: _checkout(dispatch, resolveCartId, client, emit),
    accountCheckout: _accountCheckout(dispatch, resolveCartId, client, emit),
    isUpdatingCart: state.kind === "updating-cart-state",
    state,
  }
}

function _stripeIntent(
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  client: EPCCClient,
  _emit?: (event: StoreEvent) => void,
) {
  return async (
    email: string,
    shippingAddress: Partial<OrderShippingAddress>,
    sameAsShipping?: boolean,
    billingAddress?: Partial<OrderBillingAddress>,
  ): Promise<{ data: Order }> => {
    const cartId = resolveCartId()

    const customer = `${shippingAddress.first_name} ${shippingAddress.last_name}`
    return await checkout(
      cartId,
      {
        email,
        name: customer,
      },
      billingAddress && !sameAsShipping ? billingAddress : shippingAddress,
      shippingAddress,
      client,
    )
  }
}

function _checkout(
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  client: EPCCClient,
  _emit?: (event: StoreEvent) => void,
) {
  return async (
    email: string,
    shippingAddress: Partial<OrderShippingAddress>,
    payment: PaymentRequestBody,
    sameAsShipping?: boolean,
    billingAddress?: Partial<OrderBillingAddress>,
  ): Promise<ConfirmPaymentResponse> => {
    const cartId = resolveCartId()

    dispatch({
      type: "updating-cart",
      payload: { action: "checkout" },
    })

    const customer = `${shippingAddress.first_name} ${shippingAddress.last_name}`
    const orderResponse = await checkout(
      cartId,
      {
        email,
        name: customer,
      },
      billingAddress && !sameAsShipping ? billingAddress : shippingAddress,
      shippingAddress,
      client,
    )

    const paymentResponse = await makePayment(
      payment,
      orderResponse.data.id,
      client,
    )

    const response = await removeAllCartItems(cartId, client)

    dispatch({
      type: "update-cart",
      payload: { id: cartId, meta: response.meta, items: response.data },
    })

    return paymentResponse
  }
}

function _accountCheckout(
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  client: EPCCClient,
  _emit?: (event: StoreEvent) => void,
) {
  return async (
    name: string,
    email: string,
    token: string,
    shippingAddress: Partial<OrderShippingAddress>,
    payment: PaymentRequestBody,
    sameAsShipping?: boolean,
    billingAddress?: Partial<OrderBillingAddress>,
  ): Promise<ConfirmPaymentResponse> => {
    const cartId = resolveCartId()

    dispatch({
      type: "updating-cart",
      payload: { action: "checkout" },
    })

    const customer = `${shippingAddress.first_name} ${shippingAddress.last_name}`

    const orderResponse = await client
      .Cart(cartId)
      .CheckoutWithAccountManagementToken(
        {
          email,
          name: customer,
        },
        billingAddress && !sameAsShipping ? billingAddress : shippingAddress,
        shippingAddress,
        // @ts-ignore
        token, // TODO types are once again wrong and the api of this method needs work we should be able to set the authed account onto the sdk
      )

    const paymentResponse = await makePayment(
      payment,
      orderResponse.data.id,
      client,
    )

    const response = await removeAllCartItems(cartId, client)

    dispatch({
      type: "update-cart",
      payload: { id: cartId, meta: response.meta, items: response.data },
    })

    return paymentResponse
  }
}

function _updateCartItem(
  client: EPCCClient,
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  eventEmitter?: (event: StoreEvent) => void,
) {
  return async (itemId: string, quantity: number): Promise<void> => {
    const cartId = resolveCartId()

    dispatch({
      type: "updating-cart",
      payload: { action: "update" },
    })

    try {
      const response = await updateCartItem(cartId, itemId, quantity, client)

      dispatch({
        type: "update-cart",
        payload: { id: cartId, meta: response.meta, items: response.data },
      })
      attemptEmitSuccess("update-cart", "Updated cart item", eventEmitter)
    } catch (err) {
      dispatch({
        type: "failed-cart-update",
      })
      attemptEmitError(
        err,
        "update-cart",
        "Failed to update product in cart",
        eventEmitter,
      )
      throw err
    }
  }
}

function _addProductToCart(
  client: EPCCClient,
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  eventEmitter?: (event: StoreEvent) => void,
) {
  return async (productId: string, quantity: number): Promise<void> => {
    const cartId = resolveCartId()

    dispatch({
      type: "updating-cart",
      payload: { action: "add" },
    })

    try {
      const response = await addProductToCart(
        cartId,
        productId,
        quantity,
        client,
      )

      dispatch({
        type: "update-cart",
        payload: { id: cartId, meta: response.meta, items: response.data },
      })
      attemptEmitSuccess(
        "add-to-cart",
        `Added "${resolveProductName(response, productId)}" to cart`,
        eventEmitter,
      )
    } catch (err) {
      dispatch({
        type: "failed-cart-update",
      })
      attemptEmitError(
        err,
        "add-to-cart",
        "Failed to add product to cart",
        eventEmitter,
      )
      throw err
    }
  }
}

function _addBundleProductToCart(
  client: EPCCClient,
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  eventEmitter?: (event: StoreEvent) => void,
) {
  return async (
    productId: string,
    selectedOptions: SelectedOptions,
    quantity: number,
  ): Promise<void> => {
    const cartId = resolveCartId()

    dispatch({
      type: "updating-cart",
      payload: { action: "add" },
    })

    try {
      const response = await addBundleProductToCart(
        cartId,
        productId,
        selectedOptions,
        quantity,
        client,
      )

      dispatch({
        type: "update-cart",
        payload: { id: cartId, meta: response.meta, items: response.data },
      })
      attemptEmitSuccess(
        "add-to-cart",
        `Added "${resolveProductName(response, productId)}" to cart`,
        eventEmitter,
      )
    } catch (err) {
      dispatch({
        type: "failed-cart-update",
      })
      attemptEmitError(
        err,
        "add-to-cart",
        "Failed to add product to cart",
        eventEmitter,
      )
      throw err
    }
  }
}

function resolveProductName(
  cartItems: CartItemsResponse,
  productId: string,
): string {
  const maybeProduct = cartItems.data.find((i) => i.product_id === productId)
  if (maybeProduct) {
    return maybeProduct.name
  }
  return "Unknown"
}

function _addCustomItemToCart(
  client: EPCCClient,
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  eventEmitter?: (event: StoreEvent) => void,
) {
  return async (customItem: CustomItemRequest): Promise<void> => {
    const cartId = resolveCartId()

    dispatch({
      type: "updating-cart",
      payload: { action: "add" },
    })

    try {
      const response = await addCustomItemToCart(cartId, customItem, client)
      dispatch({
        type: "update-cart",
        payload: { id: cartId, meta: response.meta, items: response.data },
      })
      attemptEmitSuccess(
        "add-to-cart",
        `Added ${customItem.name} to cart`,
        eventEmitter,
      )
    } catch (err) {
      dispatch({
        type: "failed-cart-update",
      })
      attemptEmitError(
        err,
        "add-to-cart",
        "Failed to add custom item to cart",
        eventEmitter,
      )
      throw err
    }
  }
}

function _addPromotionToCart(
  client: EPCCClient,
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  eventEmitter?: (event: StoreEvent) => void,
) {
  return async (promoCode: string): Promise<void> => {
    const cartId = resolveCartId()

    dispatch({
      type: "updating-cart",
      payload: { action: "add" },
    })

    try {
      const response = await addPromotion(cartId, promoCode, client)
      dispatch({
        type: "update-cart",
        payload: { id: cartId, meta: response.meta, items: response.data },
      })
      attemptEmitSuccess("add-to-cart", "Added promotion to cart", eventEmitter)
    } catch (err) {
      dispatch({
        type: "failed-cart-update",
      })
      attemptEmitError(
        err,
        "add-to-cart",
        "Failed to add promotion to cart",
        eventEmitter,
      )
      throw err
    }
  }
}

function _removeCartItem(
  client: EPCCClient,
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  eventEmitter?: (event: StoreEvent) => void,
) {
  return async (itemId: string): Promise<void> => {
    const cartId = resolveCartId()

    dispatch({
      type: "updating-cart",
      payload: { action: "remove" },
    })

    try {
      const response = await removeCartItem(cartId, itemId, client)

      dispatch({
        type: "update-cart",
        payload: { id: cartId, meta: response.meta, items: response.data },
      })
      attemptEmitSuccess(
        "remove-from-cart",
        `Removed item from cart`,
        eventEmitter,
      )
    } catch (err) {
      dispatch({
        type: "failed-cart-update",
      })
      attemptEmitError(
        err,
        "remove-from-cart",
        "Failed to remove product from cart",
        eventEmitter,
      )
      throw err
    }
  }
}

function _emptyCart(
  client: EPCCClient,
  dispatch: (action: CartAction) => void,
  state: CartState,
  resolveCartId: () => string,
  eventEmitter?: (event: StoreEvent) => void,
) {
  return async (): Promise<void> => {
    const cartId = resolveCartId()

    if (state.kind === "present-cart-state") {
      dispatch({
        type: "updating-cart",
        payload: { action: "empty" },
      })

      try {
        const response = await removeAllCartItems(cartId, client)

        dispatch({
          type: "update-cart",
          payload: { id: cartId, meta: response.meta, items: response.data },
        })

        attemptEmitSuccess("empty-cart", "Emptied cart", eventEmitter)
      } catch (err) {
        dispatch({
          type: "failed-cart-update",
        })
        attemptEmitError(
          err,
          "empty-cart",
          "Failed to empty cart",
          eventEmitter,
        )
        throw err
      }
    }
  }
}

function createError(err: unknown, msg: string): StoreError {
  if (err instanceof Error) {
    return {
      type: "cart-store-error",
      // @ts-ignore TODO
      cause: new Error(msg, { cause: err }),
    }
  }

  return {
    type: "cart-store-error",
    cause: new Error(`${msg} - The cause of the error is unknown`),
  }
}

function attemptEmitError(
  err: unknown,
  action: StoreCartAction,
  msg: string,
  emitter?: (event: StoreEvent) => void,
): void {
  if (emitter) {
    emitter({
      type: "error",
      scope: "cart",
      message: msg,
      action,
      cause: createError(err, msg),
    })
  }
}

function attemptEmitSuccess(
  action: StoreCartAction,
  msg: string,
  emitter?: (event: StoreEvent) => void,
): void {
  if (emitter) {
    emitter({
      type: "success",
      scope: "cart",
      message: msg,
      action,
    })
  }
}

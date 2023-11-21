import React, {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from "react"
import {
  Cart,
  CartIncluded,
  ResourceIncluded,
  Moltin as EPCCClient,
} from "@moltin/sdk"
import { CartAction, CartState } from "./types/cart-reducer-types"
import { cartReducer } from "./cart-reducer"
import { getCart } from "./service/cart"
import { getInitialState } from "./util/get-initial-cart-state"
import { StoreEvent } from "../shared"
import { useStore } from "../store"

export const CartItemsContext = createContext<
  | {
      state: CartState
      dispatch: (action: CartAction) => void
      resolveCartId: () => string
      client: EPCCClient
      emit?: (event: StoreEvent) => void
    }
  | undefined
>(undefined)

export interface CartProviderProps {
  children: ReactNode
  client?: EPCCClient
  resolveCartId: () => string
  cart?: ResourceIncluded<Cart, CartIncluded>
  emit?: (event: StoreEvent) => void
}

export function CartProvider({
  cart,
  children,
  emit,
  resolveCartId,
  client: overrideClient,
}: CartProviderProps) {
  const { client: storeClient } = useStore()

  const [state, dispatch] = useReducer(cartReducer, getInitialState(cart))
  const [client] = useState(overrideClient ?? storeClient)

  useEffect(() => {
    if (state.kind === "uninitialised-cart-state") {
      _initialiseCart(dispatch, resolveCartId, client, emit)
    }
  }, [state, dispatch, emit, client])

  return (
    <CartItemsContext.Provider
      value={{ state, dispatch, emit, resolveCartId, client }}
    >
      {children}
    </CartItemsContext.Provider>
  )
}

async function _initialiseCart(
  dispatch: (action: CartAction) => void,
  resolveCartId: () => string,
  client: EPCCClient,
  emit?: (event: StoreEvent) => void,
) {
  const cartId = resolveCartId()

  dispatch({
    type: "initialise-cart",
  })

  const resp = await getCart(cartId, client)

  dispatch({
    type: "update-cart",
    payload: {
      id: resp.data.id,
      meta: resp.data.meta,
      items: resp.included?.items ?? [],
    },
  })

  if (emit) {
    emit({
      type: "success",
      scope: "cart",
      action: "init",
      message: "Initialised cart",
    })
  }
}

import React, { createContext, ReactNode } from "react"
import { Cart, CartIncluded, ResourceIncluded, CartItem } from "@moltin/sdk"
import { CartState } from "./types/cart-types"
import { enhanceCartResponse } from "./util/enhance-cart-response"
import { StoreEvent } from "../shared"
import { useGetCart } from "./hooks/use-get-cart"
import { useElasticPath } from "../elasticpath"

export const CartItemsContext = createContext<
  | ({
      state: CartState | undefined
      cartId: string
      emit?: (event: StoreEvent) => void
    } & Omit<ReturnType<typeof useGetCart>, "data">)
  | undefined
>(undefined)

export interface CartProviderProps {
  children: ReactNode
  cartId?: string
  initialState?: {
    cart?: ResourceIncluded<Cart, CartIncluded>
  }
  emit?: (event: StoreEvent) => void
}

export function CartProvider({
  initialState,
  children,
  emit,
  cartId: sourceCartId,
}: CartProviderProps) {
  const { client } = useElasticPath()

  const cartId = sourceCartId ?? client.Cart().cartId

  const { data: rawCartData, ...rest } = useGetCart(cartId, {
    initialData: initialState?.cart,
  })

  const state =
    rawCartData &&
    enhanceCartResponse({
      data: rawCartData,
      included: rest.included,
    })

  return (
    <CartItemsContext.Provider
      value={{
        state,
        emit,
        cartId,
        ...rest,
      }}
    >
      {children}
    </CartItemsContext.Provider>
  )
}

export function createCartItemsUpdater(updatedData: CartItem[]) {
  return function cartItemsUpdater(
    oldData: ResourceIncluded<Cart, CartIncluded>,
  ) {
    return {
      ...oldData,
      included: {
        items: updatedData,
      },
    }
  }
}
export const useCart = () => {
  const context = React.useContext(CartItemsContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

import React, { createContext, ReactNode } from "react"
import {
  Cart,
  CartIncluded,
  ResourceIncluded,
  CartItem,
  CartItemsResponse,
} from "@moltin/sdk"
import { CartState } from "./types/cart-types"
import { enhanceCartResponse } from "./util/enhance-cart-response"
import { StoreEvent } from "../shared"
import { cartQueryKeys, useGetCart } from "./hooks/use-get-cart"
import { useUpdateCartItem } from "./hooks/use-update-cart-items"
import { useQueryClient } from "@tanstack/react-query"
import { useRemoveCartItem } from "./hooks/use-remove-cart-item"
import {
  useAddBundleProductToCart,
  useAddProductToCart,
  useAddPromotionToCart,
  useDeleteCartItems,
} from "./hooks"
import { useRemovePromotionCode } from "./hooks/use-remove-promotion"

export const CartItemsContext = createContext<
  | ({
      state: CartState | undefined
      cartId?: string
      emit?: (event: StoreEvent) => void
      useScopedUpdateCartItem: () => ReturnType<typeof useUpdateCartItem>
      useScopedRemoveCartItem: () => ReturnType<typeof useRemoveCartItem>
      useScopedAddPromotion: () => ReturnType<typeof useAddPromotionToCart>
      useScopedRemovePromotion: () => ReturnType<typeof useRemovePromotionCode>
      useScopedAddProductToCart: () => ReturnType<typeof useAddProductToCart>
      useScopedAddBundleProductToCart: () => ReturnType<
        typeof useAddBundleProductToCart
      >
      useClearCart: () => ReturnType<typeof useDeleteCartItems>
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
  cartId = "",
}: CartProviderProps) {
  const queryClient = useQueryClient()

  const { data: rawCartData, ...rest } = useGetCart(cartId, {
    initialData: initialState?.cart,
  })

  async function invalidateCartQuery() {
    return queryClient.invalidateQueries({
      queryKey: cartQueryKeys.detail(cartId),
    })
  }

  function setCartQueryData(updatedData: CartItemsResponse) {
    // Updates the cart items in the query cache
    return queryClient.setQueryData(
      cartQueryKeys.detail(cartId),
      createCartItemsUpdater(updatedData.data),
    )
  }

  const state =
    rawCartData &&
    enhanceCartResponse({
      data: rawCartData,
      included: rest.included,
    })

  const updateCartItem = () =>
    useUpdateCartItem(cartId, {
      onSuccess: (updatedData) => {
        setCartQueryData(updatedData)
        invalidateCartQuery()
      },
    })

  const addProductToCart = () =>
    useAddProductToCart(cartId, {
      onSuccess: (updatedData) => {
        setCartQueryData(updatedData)
        invalidateCartQuery()
      },
    })

  const removeCartItem = () =>
    useRemoveCartItem(cartId, {
      onSuccess: (updatedData) => {
        setCartQueryData(updatedData)
        invalidateCartQuery()
      },
    })

  const addPromotion = () =>
    useAddPromotionToCart(cartId, {
      onSuccess: (updatedData) => {
        setCartQueryData(updatedData)
        invalidateCartQuery()
      },
    })

  const removePromotion = () =>
    useRemovePromotionCode(cartId, {
      onSuccess: (updatedData) => {
        setCartQueryData(updatedData)
        invalidateCartQuery()
      },
    })

  const addBundleItemToCart = () =>
    useAddBundleProductToCart(cartId, {
      onSuccess: (updatedData) => {
        setCartQueryData(updatedData)
        invalidateCartQuery()
      },
    })

  const clearCart = () =>
    useDeleteCartItems(cartId, {
      onSuccess: async (updatedData) => {
        setCartQueryData(updatedData)
        await invalidateCartQuery()
      },
    })

  return (
    <CartItemsContext.Provider
      value={{
        state,
        emit,
        cartId: cartId ? cartId : undefined,
        useScopedUpdateCartItem: updateCartItem,
        useScopedRemoveCartItem: removeCartItem,
        useScopedAddPromotion: addPromotion,
        useScopedRemovePromotion: removePromotion,
        useScopedAddProductToCart: addProductToCart,
        useScopedAddBundleProductToCart: addBundleItemToCart,
        useClearCart: clearCart,
        ...rest,
      }}
    >
      {children}
    </CartItemsContext.Provider>
  )
}

function createCartItemsUpdater(updatedData: CartItem[]) {
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

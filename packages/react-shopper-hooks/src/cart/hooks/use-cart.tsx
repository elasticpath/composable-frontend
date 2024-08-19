"use client"

import React from "react"
import {
  Cart,
  CartIncluded,
  ResourceIncluded,
  CartItem,
} from "@elasticpath/js-sdk"
import { CartState } from "../types/cart-types"
import { enhanceCartResponse } from "../util/enhance-cart-response"
import { StoreEvent } from "../../shared"
import { CartQueryKey, cartQueryKeys } from "./use-get-cart"
import { useElasticPath } from "../../elasticpath"
import { UseQueryOptionsWrapper } from "../../types"
import { UseQueryResult } from "@tanstack/react-query/build/modern/index"
import { useQuery } from "@tanstack/react-query"

export type UseCartData = {
  state: CartState
  cartId: string
  emit?: (event: StoreEvent) => void
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

export function useCart(
  id?: string,
  options?: UseQueryOptionsWrapper<
    ResourceIncluded<Cart, CartIncluded>,
    Error,
    ReturnType<CartQueryKey["detail"]>
  >,
): UseQueryResult<UseCartData, Error> {
  const { client } = useElasticPath()
  const cartId = id ?? client.Cart().cartId

  return useQuery({
    queryKey: cartQueryKeys.detail(cartId),
    queryFn: () => client.Cart(id).With("items").Get(),
    ...options,
    select: (data) => {
      const transformedData = options?.select?.(data) ?? data

      const state = enhanceCartResponse({
        data: transformedData.data,
        included: transformedData.included,
      })

      return {
        state,
        cartId,
        // TODO: add event emitter
      }
    },
  })
}

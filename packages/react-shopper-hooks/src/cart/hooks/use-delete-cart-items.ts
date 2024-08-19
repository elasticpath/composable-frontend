"use client"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../elasticpath"
import { CartItemsResponse } from "@elasticpath/js-sdk"

export const useDeleteCartItems = (
  cartId: string,
  options?: UseMutationOptions<CartItemsResponse, Error>,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async () => {
      return client.Cart(cartId).RemoveAllItems()
    },
    ...options,
  })
}

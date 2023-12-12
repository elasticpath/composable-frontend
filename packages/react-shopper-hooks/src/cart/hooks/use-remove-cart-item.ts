import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../elasticpath"
import { CartItemsResponse } from "@moltin/sdk"

type CartUpdateReq = {
  itemId: string
}

export const useRemoveCartItem = (
  cartId: string,
  options?: UseMutationOptions<CartItemsResponse, Error, CartUpdateReq>,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({ itemId }: CartUpdateReq) => {
      return client.Cart(cartId).RemoveItem(itemId)
    },
    ...options,
  })
}

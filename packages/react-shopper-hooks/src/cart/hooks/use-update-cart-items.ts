import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../elasticpath"
import { CartItemsResponse } from "@moltin/sdk"

type CartUpdateReq = {
  itemId: string
  quantity: number
}

export const useUpdateCartItem = (
  cartId: string,
  options?: UseMutationOptions<CartItemsResponse, Error, CartUpdateReq>,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({ itemId, quantity }: CartUpdateReq) => {
      return client.Cart(cartId).UpdateItem(itemId, quantity)
    },
    ...options,
  })
}

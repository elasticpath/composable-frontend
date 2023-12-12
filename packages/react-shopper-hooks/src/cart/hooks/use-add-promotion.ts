import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../elasticpath"
import { CartItemsResponse } from "@moltin/sdk"

type CartAddPromotionReq = {
  code: string
  token?: string
}

export const useAddPromotionToCart = (
  cartId: string,
  options?: UseMutationOptions<CartItemsResponse, Error, CartAddPromotionReq>,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({ code, token }: CartAddPromotionReq) => {
      return client.Cart(cartId).AddPromotion(code, token)
    },
    ...options,
  })
}

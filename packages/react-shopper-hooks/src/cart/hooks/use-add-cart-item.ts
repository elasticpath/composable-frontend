import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../elasticpath"
import { CartAdditionalHeaders, CartItemsResponse } from "@moltin/sdk"
import { SelectedOptions } from "../types/bundle.type"

type CartAddProductReq = {
  productId: string
  quantity?: number
  data?: any
  isSku?: boolean
  token?: string
  additionalHeaders?: CartAdditionalHeaders
}

export const useAddProductToCart = (
  cartId: string,
  options?: UseMutationOptions<CartItemsResponse, Error, CartAddProductReq>,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      data,
      isSku,
      token,
      additionalHeaders,
    }) => {
      return client
        .Cart(cartId)
        .AddProduct(productId, quantity, data, isSku, token, additionalHeaders)
    },
    ...options,
  })
}

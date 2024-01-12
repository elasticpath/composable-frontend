import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { CartAdditionalHeaders, CartItemsResponse } from "@moltin/sdk"
import { useElasticPath } from "../../elasticpath"
import { SelectedOptions } from "../types/bundle.type"

export type CartAddBundleProductReq = {
  productId: string
  selectedOptions: SelectedOptions
  quantity?: number
  data?: any
  isSku?: boolean
  token?: string
  additionalHeaders?: CartAdditionalHeaders
}

export const useAddBundleProductToCart = (
  cartId: string,
  options?: UseMutationOptions<
    CartItemsResponse,
    Error,
    CartAddBundleProductReq
  >,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      data,
      selectedOptions,
      isSku,
      token,
      additionalHeaders,
    }) => {
      return client.Cart(cartId).AddProduct(
        productId,
        quantity,
        {
          bundle_configuration: {
            selected_options: selectedOptions,
          },
          ...data,
        },
        isSku,
        token,
        additionalHeaders,
      )
    },
    ...options,
  })
}

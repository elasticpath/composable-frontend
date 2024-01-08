import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { CartItemsResponse } from "@moltin/sdk"
import { useElasticPath } from "../../elasticpath"

export type CartAddCustomItemReq = {
  type: "custom_item"
  name: string
  description?: string
  sku?: string
  quantity: number
  price: {
    amount: number
    includes_tax: boolean
  }
  custom_inputs?: Record<string, any>
  shipping_group_id?: string
  tax?: any[]
}

export const useAddCustomItemToCart = (
  cartId: string,
  options?: UseMutationOptions<CartItemsResponse, Error, CartAddCustomItemReq>,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async (props) => {
      return client.Cart(cartId).AddCustomItem(props)
    },
    ...options,
  })
}

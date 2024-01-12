import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../elasticpath"
import { CartItemsResponse } from "@moltin/sdk"

type CartRemovePromotionCodeReq = {
  code: string
}

export const useRemovePromotionCode = (
  cartId: string,
  options?: UseMutationOptions<
    CartItemsResponse,
    Error,
    CartRemovePromotionCodeReq
  >,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({ code }: CartRemovePromotionCodeReq) => {
      return client.request.send(
        `carts/${cartId}/discounts/${code}`,
        "DELETE",
        undefined,
        undefined,
        client,
        undefined,
        "v2",
      )
    },
    ...options,
  })
}

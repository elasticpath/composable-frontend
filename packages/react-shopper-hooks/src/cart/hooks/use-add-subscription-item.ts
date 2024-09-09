"use client"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { CartAdditionalHeaders, CartItemsResponse } from "@elasticpath/js-sdk"
import { useElasticPath } from "../../elasticpath"

export type CartAddSubscriptionItemReq = {
  id: string
  subscription_configuration: {
    plan: string
  }
  quantity: number
  custom_inputs?: Record<string, any>
  shipping_group_id?: string
  tax?: any[]
  additionalHeaders?: CartAdditionalHeaders
}

export const useAddSubscriptionItemToCart = (
  cartId: string,
  options?: UseMutationOptions<
    CartItemsResponse,
    Error,
    CartAddSubscriptionItemReq
  >,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({ additionalHeaders, ...req }) => {
      const body = {
        data: {
          type: "subscription_item",
          ...req,
        }
      }

      return client.request.send(
        `carts/${cartId}/items`,
        "POST",
        body,
        undefined,
        client,
        false,
        "v2",
        (additionalHeaders as { [key: string]: string }) ?? {},
      )
    },
    ...options,
  })
}

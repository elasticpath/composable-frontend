"use client"

import { createCartItemsUpdater, useCart } from "./use-cart"
import { useQueryClient } from "@tanstack/react-query"
import { cartQueryKeys } from "./use-get-cart"
import { useEventInternal } from "../../event/use-event-internal"
import { useAddSubscriptionItemToCart } from "./use-add-subscription-item"

export function useCartAddSubscriptionItem() {
  const { data } = useCart()
  const queryClient = useQueryClient()
  const { eventsSubject } = useEventInternal()

  const cartId = data?.cartId!

  return useAddSubscriptionItemToCart(cartId, {
    onSuccess: (updatedData) => {
      // Updates the cart items in the query cache
      queryClient.setQueryData(
        cartQueryKeys.detail(cartId),
        createCartItemsUpdater(updatedData.data),
      )

      eventsSubject.notify({
        scope: "cart",
        action: "add-subscription-item",
        type: "success",
        message: "Successfully added subscription item to cart",
      })

      return queryClient.invalidateQueries({
        queryKey: cartQueryKeys.detail(cartId),
      })
    },
  })
}

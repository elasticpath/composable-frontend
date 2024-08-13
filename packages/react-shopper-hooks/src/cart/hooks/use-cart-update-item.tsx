"use client"

import { createCartItemsUpdater, useCart } from "./use-cart"
import { useQueryClient } from "@tanstack/react-query"
import { cartQueryKeys } from "./use-get-cart"
import { useUpdateCartItem } from "./use-update-cart-items"
import { useEventInternal } from "../../event/use-event-internal"

export function useCartUpdateItem() {
  const { data } = useCart()
  const queryClient = useQueryClient()
  const { eventsSubject } = useEventInternal()

  const cartId = data?.cartId!

  return useUpdateCartItem(cartId, {
    onSuccess: (updatedData) => {
      // Updates the cart items in the query cache
      queryClient.setQueryData(
        cartQueryKeys.detail(cartId),
        createCartItemsUpdater(updatedData.data),
      )

      eventsSubject.notify({
        scope: "cart",
        action: "update-cart-item",
        type: "success",
        message: "Successfully updated item in cart.",
      })

      return queryClient.invalidateQueries({
        queryKey: cartQueryKeys.detail(cartId),
      })
    },
  })
}

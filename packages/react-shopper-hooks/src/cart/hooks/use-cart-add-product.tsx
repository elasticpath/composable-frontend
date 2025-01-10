"use client"

import { getCartQueryKey, manageCartsMutation } from "@epcc-sdk/sdks-shopper"
import { createCartItemsUpdater, useCart } from "./use-cart"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEventInternal } from "../../event/use-event-internal"

export function useCartAddProduct() {
  const { data } = useCart()
  const queryClient = useQueryClient()
  const { eventsSubject } = useEventInternal()

  const cartId = data?.cartId!

  return useMutation({
    ...manageCartsMutation({
      path: {
        cartID: cartId,
      },
    }),
    onSuccess: (updatedData, req) => {
      // Updates the cart items in the query cache
      if (!updatedData.data) return

      const queryKey = getCartQueryKey({ path: { cartID: cartId } })

      queryClient.setQueryData(
        queryKey,
        createCartItemsUpdater(updatedData.data),
      )

      eventsSubject.notify({
        scope: "cart",
        action: "add-product",
        type: "success",
        message: "Successfully added product to cart",
      })

      return queryClient.invalidateQueries({
        queryKey,
      })
    },
  })
}

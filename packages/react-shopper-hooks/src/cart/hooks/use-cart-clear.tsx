import { createCartItemsUpdater, useCart } from "./use-cart"
import { useQueryClient } from "@tanstack/react-query"
import { cartQueryKeys } from "./use-get-cart"
import { useDeleteCartItems } from "./use-delete-cart-items"
import { useEventInternal } from "../../event/use-event-internal"

export function useCartClear() {
  const { data } = useCart()
  const { eventsSubject } = useEventInternal()

  const cartId = data?.cartId!

  const queryClient = useQueryClient()

  return useDeleteCartItems(cartId, {
    onSuccess: (updatedData) => {
      // Updates the cart items in the query cache
      queryClient.setQueryData(
        cartQueryKeys.detail(cartId),
        createCartItemsUpdater(updatedData.data),
      )

      eventsSubject.notify({
        scope: "cart",
        action: "empty-cart",
        type: "success",
        message: "Successfully emptied cart.",
      })

      return queryClient.invalidateQueries({
        queryKey: cartQueryKeys.detail(cartId),
      })
    },
  })
}

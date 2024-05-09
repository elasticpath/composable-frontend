import { createCartItemsUpdater, useCart } from "./use-cart"
import { useQueryClient } from "@tanstack/react-query"
import { cartQueryKeys } from "./use-get-cart"
import { useRemovePromotionCode } from "./use-remove-promotion"
import { useEventInternal } from "../../event/use-event-internal"

export function useCartRemovePromotion() {
  const { data } = useCart()
  const queryClient = useQueryClient()
  const { eventsSubject } = useEventInternal()

  const cartId = data?.cartId!

  return useRemovePromotionCode(cartId, {
    onSuccess: (updatedData) => {
      // Updates the cart items in the query cache
      queryClient.setQueryData(
        cartQueryKeys.detail(cartId),
        createCartItemsUpdater(updatedData.data),
      )

      eventsSubject.notify({
        scope: "cart",
        action: "remove-promotion",
        type: "success",
        message: "Successfully removed promotion from cart.",
      })

      return queryClient.invalidateQueries({
        queryKey: cartQueryKeys.detail(cartId),
      })
    },
  })
}

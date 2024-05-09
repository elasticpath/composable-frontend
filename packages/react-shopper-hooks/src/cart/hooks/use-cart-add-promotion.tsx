import { createCartItemsUpdater, useCart } from "./use-cart"
import { useQueryClient } from "@tanstack/react-query"
import { cartQueryKeys } from "./use-get-cart"
import { useAddPromotionToCart } from "./use-add-promotion"
import { useEventInternal } from "../../event/use-event-internal"

export function useCartAddPromotion() {
  const { data } = useCart()
  const queryClient = useQueryClient()
  const { eventsSubject } = useEventInternal()

  const cartId = data?.cartId!

  return useAddPromotionToCart(cartId, {
    onSuccess: (updatedData) => {
      // Updates the cart items in the query cache
      queryClient.setQueryData(
        cartQueryKeys.detail(cartId),
        createCartItemsUpdater(updatedData.data),
      )

      eventsSubject.notify({
        scope: "cart",
        action: "add-promotion",
        type: "success",
        message: "Successfully added promotion to cart",
      })

      return queryClient.invalidateQueries({
        queryKey: cartQueryKeys.detail(cartId),
      })
    },
  })
}

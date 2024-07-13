import { createCartItemsUpdater, useCart } from "./use-cart"
import { useQueryClient } from "@tanstack/react-query"
import { cartQueryKeys } from "./use-get-cart"
import { useAddBundleProductToCart } from "./use-add-bundle-product-to-cart"
import { useEventInternal } from "../../event/use-event-internal"

export function useCartAddBundleItem() {
  const { data } = useCart()
  const queryClient = useQueryClient()
  const { eventsSubject } = useEventInternal()

  const cartId = data?.cartId!

  return useAddBundleProductToCart(cartId, {
    onSuccess: (updatedData) => {
      // Updates the cart items in the query cache
      queryClient.setQueryData(
        cartQueryKeys.detail(cartId),
        createCartItemsUpdater(updatedData.data),
      )

      eventsSubject.notify({
        scope: "cart",
        action: "add-bundle-item",
        type: "success",
        message: "Successfully added bundle item to cart",
      })

      return queryClient.invalidateQueries({
        queryKey: cartQueryKeys.detail(cartId),
      })
    },
  })
}

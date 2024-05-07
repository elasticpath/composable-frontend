import { createCartItemsUpdater, useCart } from "./use-cart"
import { useQueryClient } from "@tanstack/react-query"
import { cartQueryKeys } from "./use-get-cart"
import { useAddBundleProductToCart } from "./use-add-bundle-product-to-cart"

export function useCartAddBundleItem() {
  const { data } = useCart()
  const queryClient = useQueryClient()

  const cartId = data?.cartId!

  return useAddBundleProductToCart(cartId, {
    onSuccess: (updatedData) => {
      // Updates the cart items in the query cache
      queryClient.setQueryData(
        cartQueryKeys.detail(cartId),
        createCartItemsUpdater(updatedData.data),
      )
      return queryClient.invalidateQueries({
        queryKey: cartQueryKeys.detail(cartId),
      })
    },
  })
}

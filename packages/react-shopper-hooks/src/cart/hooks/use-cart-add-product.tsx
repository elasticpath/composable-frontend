import { useAddProductToCart } from "./use-add-product"
import { createCartItemsUpdater, useCart } from "./use-cart"
import { useQueryClient } from "@tanstack/react-query"
import { cartQueryKeys } from "./use-get-cart"

export function useCartAddProduct() {
  const { data } = useCart()
  const queryClient = useQueryClient()

  const cartId = data?.cartId!

  return useAddProductToCart(cartId, {
    onSuccess: (updatedData, req) => {
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

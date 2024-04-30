import { useAddProductToCart } from "./use-add-product"
import { createCartItemsUpdater, useCart } from "../cart-provider"
import { useQueryClient } from "@tanstack/react-query"
import { cartQueryKeys } from "./use-get-cart"

export function useCartAddProduct() {
  const { cartId } = useCart()
  const queryClient = useQueryClient()
  return useAddProductToCart(cartId, {
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

import {
  Address,
  Cart,
  CartAdditionalHeaders,
  CartItemsResponse,
  CheckoutCustomer,
  CheckoutCustomerObject,
  CreateCartObject,
  Moltin as ElasticPath,
  Order,
  Resource,
} from "@moltin/sdk"
import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../context"

type CartFnReturn = ReturnType<ElasticPath["Cart"]>

export const useCreateCart = (
  options?: UseMutationOptions<
    Resource<Cart>,
    Error,
    {
      data: CreateCartObject
      token?: string
    }
  >,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: ({ data, token }: { data: CreateCartObject; token?: string }) =>
      client.Cart().CreateCart(data, token),
    ...options,
  })
}

export const useUpdateCart = (
  cartId: string,
  options?: UseMutationOptions<
    CartItemsResponse,
    Error,
    {
      data: CreateCartObject
      token?: string
    }
  >,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: ({ data, token }: { data: CreateCartObject; token?: string }) =>
      client.Cart(cartId).UpdateCart(data, token),
    ...options,
  })
}

export const useCheckoutCart = (
  cartId: string,
  options?: UseMutationOptions<
    Resource<Order>,
    Error,
    {
      customer: string | CheckoutCustomer | CheckoutCustomerObject
      billingAddress: Partial<Address>
      shippingAddress?: Partial<Address>
      additionalHeaders?: CartAdditionalHeaders
    }
  >,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: ({
      customer,
      billingAddress,
      shippingAddress,
      additionalHeaders,
    }: {
      customer: string | CheckoutCustomer | CheckoutCustomerObject
      billingAddress: Partial<Address>
      shippingAddress?: Partial<Address>
      additionalHeaders?: CartAdditionalHeaders
    }) =>
      client
        .Cart(cartId)
        .Checkout(customer, billingAddress, shippingAddress, additionalHeaders),
    ...options,
  })
}

export const useRemoveAllItems = (
  cartId: string,
  options?: UseMutationOptions<CartItemsResponse, Error>,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: () => client.Cart(cartId).RemoveAllItems(),
    ...options,
  })
}

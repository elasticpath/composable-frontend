import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "../../elasticpath"
import {
  Address,
  CartAdditionalHeaders,
  CheckoutCustomer,
  CheckoutCustomerObject,
  Order,
  Resource,
} from "@moltin/sdk"

export type UseCheckoutReq = {
  customer: string | CheckoutCustomer | CheckoutCustomerObject
  billingAddress: Partial<Address>
  shippingAddress?: Partial<Address>
  additionalHeaders?: CartAdditionalHeaders
}

export const useCheckout = (
  cartId: string,
  options?: UseMutationOptions<Resource<Order>, Error, UseCheckoutReq>,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({
      customer,
      billingAddress,
      shippingAddress,
      additionalHeaders,
    }: UseCheckoutReq) => {
      return client
        .Cart(cartId)
        .Checkout(customer, billingAddress, shippingAddress, additionalHeaders)
    },
    ...options,
  })
}

export type UseCheckoutWithAccountReq = {
  contact: string | CheckoutCustomer | CheckoutCustomerObject
  billingAddress: Partial<Address>
  token: string
  shippingAddress?: Partial<Address>
  additionalHeaders?: CartAdditionalHeaders
}

export const useCheckoutWithAccount = (
  cartId: string,
  options?: UseMutationOptions<
    Resource<Order>,
    Error,
    UseCheckoutWithAccountReq
  >,
) => {
  const { client } = useElasticPath()
  return useMutation({
    mutationFn: async ({
      contact,
      billingAddress,
      shippingAddress,
      token,
      additionalHeaders,
    }: UseCheckoutWithAccountReq) => {
      return client.Cart(cartId).CheckoutWithAccountManagementToken(
        contact,
        billingAddress,
        shippingAddress,
        token,
        // @ts-ignore TODO: Fix type definition in js-sdk
        additionalHeaders,
      )
    },
    ...options,
  })
}

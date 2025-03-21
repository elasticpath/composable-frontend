"use client"

import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { useElasticPath } from "@elasticpath/react-shopper-hooks"
import {
    Address,
    CartAdditionalHeaders,
    CheckoutCustomer,
    CheckoutCustomerObject,
    ElasticPath,
    Order,
    Resource,
} from "@elasticpath/js-sdk"

export type UseCheckoutReq = {
    customer: string | CheckoutCustomer | CheckoutCustomerObject
    billingAddress: Partial<Address>
    shippingAddress?: Partial<Address>
    additionalHeaders?: CartAdditionalHeaders,
    shortOrder?: string
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
            shortOrder
        }: UseCheckoutReq) => {
            return shortOrder ? checkoutWithShortOrder(client, cartId, shortOrder, billingAddress, shippingAddress, customer, undefined, additionalHeaders as { [key: string]: string }) :
                checkoutAsGuest(client, cartId, customer, billingAddress, shippingAddress, additionalHeaders)
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
    shortOrder?: string
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
            shortOrder
        }: UseCheckoutWithAccountReq) => {
            if (token && additionalHeaders) {
                additionalHeaders["EP-Account-Management-Authentication-Token"] = token;
            } else if (token) {
                additionalHeaders = { "EP-Account-Management-Authentication-Token": token };
            }
            return shortOrder ? checkoutWithShortOrder(client, cartId, shortOrder, billingAddress, shippingAddress, undefined, contact, additionalHeaders as { [key: string]: string }) :
                checkoutWithContact(client, cartId, contact, billingAddress, shippingAddress, token, additionalHeaders)
        },
        ...options,
    })
}
function checkoutAsGuest(client: ElasticPath, cartId: string, customer: string | CheckoutCustomer | CheckoutCustomerObject, billingAddress: Partial<Address>, shippingAddress: Partial<Address> | undefined, additionalHeaders: CartAdditionalHeaders | undefined): Resource<Order> | PromiseLike<Resource<Order>> {
    return client
        .Cart(cartId)
        .Checkout(customer, billingAddress, shippingAddress, additionalHeaders)
}

function checkoutWithContact(client: ElasticPath, cartId: string, contact: string | CheckoutCustomer | CheckoutCustomerObject, billingAddress: Partial<Address>, shippingAddress: Partial<Address> | undefined, token: string, additionalHeaders: CartAdditionalHeaders | undefined): Resource<Order> | PromiseLike<Resource<Order>> {
    return client.Cart(cartId).CheckoutWithAccountManagementToken(
        contact,
        billingAddress,
        shippingAddress,
        token,
        // @ts-ignore TODO: Fix type definition in js-sdk
        additionalHeaders
    )
}

function checkoutWithShortOrder(client: ElasticPath,
    cartId: string,
    shortOrderId: string,
    billingAddress: Partial<Address>,
    shippingAddress: Partial<Address> | undefined,
    customer?: string | CheckoutCustomer | CheckoutCustomerObject,
    contact?: string | CheckoutCustomer | CheckoutCustomerObject,
    additionalHeaders?: { [key: string]: string }) {

    const body: {
        customer?: string | CheckoutCustomer | CheckoutCustomerObject,
        contact?:string | CheckoutCustomer | CheckoutCustomerObject,
        order_number: string,
        billing_address: Partial<Address>,
        shipping_address?: Partial<Address>

    } = {
        order_number: shortOrderId,
        billing_address: billingAddress,
        shipping_address: shippingAddress
    }
    body.customer = customer;
    body.contact = contact;


    return client.request.send(`/carts/${cartId}/checkout`, "POST", body, undefined, client, undefined, "v2",
        additionalHeaders,
    );
}


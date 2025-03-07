// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options } from "@hey-api/client-fetch"
import type {
  GetAllGatewaysData,
  GetAllGatewaysResponse,
  GetAllGatewaysError,
  GetAGatewayData,
  GetAGatewayResponse,
  GetAGatewayError,
  UpdateManualGatewayData,
  UpdateManualGatewayResponse,
  UpdateManualGatewayError,
  UpdateBraintreeGatewayData,
  UpdateBraintreeGatewayResponse,
  UpdateBraintreeGatewayError,
  UpdateStripeGatewayData,
  UpdateStripeGatewayResponse,
  UpdateStripeGatewayError,
  UpdateStripeIntentsGatewayData,
  UpdateStripeIntentsGatewayResponse,
  UpdateStripeIntentsGatewayError,
  UpdateStripeConnectGatewayData,
  UpdateStripeConnectGatewayResponse,
  UpdateStripeConnectGatewayError,
  UpdateEpPaymentsStripeData,
  UpdateEpPaymentsStripeResponse,
  UpdateEpPaymentsStripeError,
  UpdatePaypalExpressCheckoutGatewayData,
  UpdatePaypalExpressCheckoutGatewayResponse,
  UpdatePaypalExpressCheckoutGatewayError,
  UpdateAdyenGatewayData,
  UpdateAdyenGatewayResponse,
  UpdateAdyenGatewayError,
  UpdateAuthorizeNetGatewayData2,
  UpdateAuthorizeNetGatewayResponse,
  UpdateAuthorizeNetGatewayError,
  UpdateCardConnectGatewayData,
  UpdateCardConnectGatewayResponse,
  UpdateCardConnectGatewayError,
  UpdateCyberSourceGatewayData,
  UpdateCyberSourceGatewayResponse,
  UpdateCyberSourceGatewayError,
} from "./types.gen"

export const client = createClient(createConfig())

/**
 * Get all Gateways
 * Retrieves all gateways.
 */
export const getAllGateways = <ThrowOnError extends boolean = false>(
  options?: Options<GetAllGatewaysData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetAllGatewaysResponse,
    GetAllGatewaysError,
    ThrowOnError
  >({
    ...options,
    url: "/v2/gateways",
  })
}

/**
 * Get a Gateway
 * Retrieves the specified gateway.
 */
export const getAGateway = <ThrowOnError extends boolean = false>(
  options: Options<GetAGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    GetAGatewayResponse,
    GetAGatewayError,
    ThrowOnError
  >({
    ...options,
    url: "/v2/gateways/{gatewaySlug}",
  })
}

/**
 * Update Manual Gateway
 * This endpoint allows you update the manual gateway.
 */
export const updateManualGateway = <ThrowOnError extends boolean = false>(
  options?: Options<UpdateManualGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateManualGatewayResponse,
    UpdateManualGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/manual",
  })
}

/**
 * Update Braintree Gateway
 * Use this endpoint to configure Braintree.
 */
export const updateBraintreeGateway = <ThrowOnError extends boolean = false>(
  options?: Options<UpdateBraintreeGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateBraintreeGatewayResponse,
    UpdateBraintreeGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/braintree",
  })
}

/**
 * Update Stripe Gateway
 * Use this endpoint to configure Stripe.
 */
export const updateStripeGateway = <ThrowOnError extends boolean = false>(
  options?: Options<UpdateStripeGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateStripeGatewayResponse,
    UpdateStripeGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/stripe",
  })
}

/**
 * Update Stripe Payment Intents Gateway
 * Use this endpoint to configure Stripe Payment Intents.
 */
export const updateStripeIntentsGateway = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<UpdateStripeIntentsGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateStripeIntentsGatewayResponse,
    UpdateStripeIntentsGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/stripe_payment_intents",
  })
}

/**
 * Update Stripe Connect Gateway
 * Use this endpoint to configure Stripe Connect in Commerce.
 *
 * :::note
 *
 * You can contact Elastic Path sales or [customer success team](mailto:customersuccess@elasticpath.com) to get more information about Stripe Connect and to check whether it will work for you.
 *
 * :::
 *
 */
export const updateStripeConnectGateway = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<UpdateStripeConnectGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateStripeConnectGatewayResponse,
    UpdateStripeConnectGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/stripe_connect",
  })
}

/**
 * Update Elastic Path Payments Powered by Stripe
 * Use this endpoint to configure Elastic Path Payments Powered by Stripe in Commerce.
 *
 * :::note
 *
 * You can contact Elastic Path sales or [customer success team](mailto:customersuccess@elasticpath.com) to get more information about Elastic Path Payments Powered by Stripe and to check whether it will work for you.
 *
 * :::
 *
 */
export const updateEpPaymentsStripe = <ThrowOnError extends boolean = false>(
  options?: Options<UpdateEpPaymentsStripeData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateEpPaymentsStripeResponse,
    UpdateEpPaymentsStripeError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/elastic_path_payments_stripe",
  })
}

/**
 * Update PayPal Express Checkout
 * Use this endpoint to configure PayPal Express Checkout.
 * :::note
 *
 * To learn more about PayPal Express Checkout and check whether it will work for you, contact your sales or [customer success team](mailto:customersuccess@elasticpath.com).
 *
 * :::
 *
 */
export const updatePaypalExpressCheckoutGateway = <
  ThrowOnError extends boolean = false,
>(
  options?: Options<UpdatePaypalExpressCheckoutGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdatePaypalExpressCheckoutGatewayResponse,
    UpdatePaypalExpressCheckoutGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/paypal_express_checkout",
  })
}

/**
 * Update Adyen Gateway
 * Use this endpoint to configure Adyen.
 */
export const updateAdyenGateway = <ThrowOnError extends boolean = false>(
  options?: Options<UpdateAdyenGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateAdyenGatewayResponse,
    UpdateAdyenGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/adyen",
  })
}

/**
 * Update Authorize.net Gateway
 *
 * Use this endpoint to configure Authorize.net.
 *
 * :::note
 * The credentials used for a test account may differ from those used for a live account. When configuring the payment gateway with your credentials and setting `test` to `true`, the system allows you to test various Authorize.net payment interactions to ensure everything works as expected. Once you are ready to go live, update `test` as `false` to direct requests to the live endpoints instead of the test account. Additionally, ensure that you switch to the credentials for the live account when making this change. To access your sandbox environment, see [Authorize.net Sandbox account](https://developer.authorize.net/hello_world/sandbox.html).
 * :::
 *
 */
export const updateAuthorizeNetGateway = <ThrowOnError extends boolean = false>(
  options?: Options<UpdateAuthorizeNetGatewayData2, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateAuthorizeNetGatewayResponse,
    UpdateAuthorizeNetGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/authorize_net",
  })
}

/**
 * Update CardConnect Gateway
 * Use this endpoint to configure CardConnect.
 */
export const updateCardConnectGateway = <ThrowOnError extends boolean = false>(
  options?: Options<UpdateCardConnectGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateCardConnectGatewayResponse,
    UpdateCardConnectGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/card_connect",
  })
}

/**
 * Update CyberSource Gateway
 * Use this endpoint to configure CyberSource.
 */
export const updateCyberSourceGateway = <ThrowOnError extends boolean = false>(
  options?: Options<UpdateCyberSourceGatewayData, ThrowOnError>,
) => {
  return (options?.client ?? client).put<
    UpdateCyberSourceGatewayResponse,
    UpdateCyberSourceGatewayError,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/v2/gateways/cyber_source",
  })
}

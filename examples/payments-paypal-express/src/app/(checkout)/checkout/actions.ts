"use server";

import { redirect } from "next/navigation";
import { staticDeliveryMethods } from "./useShippingMethod";
import {
  CheckoutForm,
  checkoutFormSchema,
} from "../../../components/checkout/form-schema/checkout-form-schema";
import { createElasticPathClient } from "../../../lib/create-elastic-path-client";
import {
  manageCarts,
  checkoutApi,
  paymentSetup,
  TransactionResponse,
  OrderResponse,
  BillingAddress,
  ShippingAddress,
  postV2AccountMembersTokens,
} from "@epcc-sdk/sdks-shopper";
import { getCartCookieServer } from "../../../lib/cart-cookie-server";
import { cookies, headers } from "next/headers";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../lib/cookie-constants";
import { generatePassword } from "../../../lib/generate-password";
import { createCookieFromGenerateTokenResponse } from "../../../lib/create-cookie-from-generate-token-response";
import { resolveOrigin } from "./resolve-origin";

const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!;

export type PaymentCompleteResponse = {
  order: OrderResponse;
  payment: TransactionResponse;
};

export async function paymentComplete(
  props: CheckoutForm,
): Promise<PaymentCompleteResponse> {
  const client = createElasticPathClient();

  const validatedProps = checkoutFormSchema.safeParse(props);

  if (!validatedProps.success) {
    console.error(JSON.stringify(validatedProps.error));
    throw new Error("Invalid form data");
  }

  const { shippingAddress, billingAddress, sameAsShipping, shippingMethod } =
    validatedProps.data;

  try {
    const customerName = `${shippingAddress.first_name} ${shippingAddress.last_name}`;

    const checkoutProps = {
      billingAddress:
        billingAddress && !sameAsShipping ? billingAddress : shippingAddress,
      shippingAddress: shippingAddress,
    };

    /**
     * The handling of shipping options is not production ready.
     * You must implement your own based on your business needs.
     */
    const shippingAmount =
      staticDeliveryMethods.find((method) => method.value === shippingMethod)
        ?.amount ?? 0;

    const cartId = await getCartCookieServer();
    /**
     * Using a cart custom_item to represent shipping for demo purposes.
     */
    const cartInclShippingResponse = await manageCarts({
      client,
      path: {
        cartID: cartId,
      },
      body: {
        data: {
          type: "custom_item",
          name: "Shipping",
          sku: shippingMethod,
          quantity: 1,
          price: {
            amount: shippingAmount,
            includes_tax: true,
          },
        },
      },
    });

    if (!cartInclShippingResponse.data?.data) {
      console.error(JSON.stringify(cartInclShippingResponse.error));
      throw new Error("Failed to add shipping to cart");
    }

    let account;
    if (
      (validatedProps.data.type === "subscription" ||
        validatedProps.data.type === "guest") &&
      validatedProps.data.guest.createAccount
    ) {
      const {
        guest: { email },
      } = validatedProps.data;

      const password = generatePassword({
        length: 16,
        numbers: true,
        symbols: true,
        strict: true,
      });

      const result = await postV2AccountMembersTokens({
        client,
        body: {
          data: {
            type: "account_management_authentication_token",
            authentication_mechanism: "self_signup",
            password_profile_id: PASSWORD_PROFILE_ID,
            username: email.toLowerCase(), // Known bug for uppercase usernames so we force lowercase.
            password,
            name: email,
            email,
          },
        },
      });

      const cookieStore = await cookies();

      if (!result.data) {
        console.error(JSON.stringify(result.error));
        throw new Error("Failed to register account");
      }

      cookieStore.set(createCookieFromGenerateTokenResponse(result.data));
    }

    /**
     * 1. Convert our cart to an order we can pay
     */
    let createdOrderResonse;
    if (
      validatedProps.data.type === "account" ||
      validatedProps.data.guest?.createAccount
    ) {
      const accountMemberCredentials = retrieveAccountMemberCredentials(
        await cookies(),
        ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
      );

      if (!accountMemberCredentials) {
        return redirect("/login");
      }

      const selectedAccount = getSelectedAccount(accountMemberCredentials);

      createdOrderResonse = await checkoutApi({
        client,
        path: {
          cartID: cartId,
        },
        body: {
          data: {
            account: {
              id: selectedAccount.account_id,
              member_id: accountMemberCredentials.accountMemberId,
            },
            contact: {
              name:
                validatedProps.data.type === "account"
                  ? validatedProps.data.account.name
                  : validatedProps.data.guest.email,
              email:
                validatedProps.data.type === "account"
                  ? validatedProps.data.account.email
                  : validatedProps.data.guest.email,
            },
            billing_address: checkoutProps.billingAddress as BillingAddress,
            shipping_address: checkoutProps.shippingAddress as ShippingAddress,
          },
        },
      });
    } else {
      createdOrderResonse = await checkoutApi({
        client,
        path: {
          cartID: cartId,
        },
        body: {
          data: {
            customer: {
              email: validatedProps.data.guest.email,
              name: customerName,
            },
            billing_address: checkoutProps.billingAddress as BillingAddress,
            shipping_address: checkoutProps.shippingAddress as ShippingAddress,
          },
        },
      });
    }

    if (!createdOrderResonse.data?.data) {
      console.error(JSON.stringify(createdOrderResonse.error));
      throw new Error("Failed to create order");
    }

    /**
     * 2. Perform payment against the order
     *  Paypal Express Checkout
     */
    const awaitedHeaders = await headers();

    const origin = resolveOrigin(awaitedHeaders);
    const orderId = createdOrderResonse.data.data.id!;

    const confirmedPaymentResponse = await paymentSetup({
      client,
      path: {
        orderID: orderId,
      },
      body: {
        data: {
          gateway: "paypal_express_checkout",
          method: "purchase",
          options: {
            description: "PayPal Checkout",
            soft_descriptor: "EP Storefront",
            application_context: {
              brand_name: "Elastic Path Storefront",
              locale: "en-US",
              landing_page: "LOGIN",
              shipping_preference: "SET_PROVIDED_ADDRESS",
              user_action: "PAY_NOW",
              return_url: origin + `/checkout/payment/${orderId}`,
              cancel_url: origin + `/checkout/payment/${orderId}/cancel`,
            },
          },
        },
      },
    });

    if (!confirmedPaymentResponse.data?.data) {
      console.error(JSON.stringify(confirmedPaymentResponse.error));
      throw new Error("Failed to confirm payment");
    }

    return {
      order: createdOrderResonse.data.data,
      payment: confirmedPaymentResponse.data.data!,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error completing payment");
  }
}

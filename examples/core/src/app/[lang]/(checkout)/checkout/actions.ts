"use server";

import { redirect } from "next/navigation";
import { staticDeliveryMethods } from "./useShippingMethod";
import {
  CheckoutForm,
  checkoutFormSchema,
} from "src/components/checkout/form-schema/checkout-form-schema";
import { createElasticPathClient } from "src/lib/create-elastic-path-client";
import {
  manageCarts,
  checkoutApi,
  paymentSetup,
  deleteAllCartItems,
  TransactionResponse,
  OrderResponse,
  BillingAddress,
  ShippingAddress,
  ElasticPathFile,
  getByContextAllProducts,
  getACart,
  Product,
  postV2AccountMembersTokens,
  CartsResponse,
} from "@epcc-sdk/sdks-shopper";
import { getCartCookieServer } from "src/lib/cart-cookie-server";
import { cookies } from "next/headers";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "src/lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "src/lib/cookie-constants";
import { revalidatePath, revalidateTag } from "next/cache";
import { extractCartItemProductIds } from "src/lib/extract-cart-item-product-ids";
import { extractCartItemMedia } from "./extract-cart-item-media";
import { generatePassword } from "src/lib/generate-password";
import { createCookieFromGenerateTokenResponse } from "src/lib/create-cookie-from-generate-token-response";

const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!;

export type PaymentCompleteResponse = {
  order: OrderResponse;
  products: Array<Product>;
  mainImageMap: Record<string, ElasticPathFile>;
  payment: TransactionResponse;
  cart: NonNullable<CartsResponse["data"]>;
};

export async function paymentComplete(
  props: CheckoutForm,
  lang: string,
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
        return redirect(lang ? `/${lang}/login` : "/login");
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
            } as any,
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
     */
    const confirmedPaymentResponse = await paymentSetup({
      client,
      path: {
        orderID: createdOrderResonse.data.data.id!,
      },
      body: {
        data: {
          gateway: "manual",
          method: "purchase",
        },
      },
    });

    /**
     * Get main images
     */

    const cartResponse = await getACart({
      client,
      path: {
        cartID: cartId,
      },
      query: {
        include: ["items"],
      },
    });

    const items = cartResponse.data?.included?.items ?? [];

    const productIds = extractCartItemProductIds(items);

    const productsResponse = await getByContextAllProducts({
      client,
      query: {
        filter: `in(id,${productIds})`,
        include: ["main_image"],
      },
    });

    const images = extractCartItemMedia({
      items,
      products: productsResponse.data?.data ?? [],
      mainImages: productsResponse.data?.included?.main_images ?? [],
    });

    /**
     * 4. Clear cart on successful payment
     */
    await deleteAllCartItems({
      client,
      path: {
        cartID: cartId,
      },
    });

    const revalidatePromises = [revalidatePath("/cart"), revalidateTag("cart")];

    await Promise.all(revalidatePromises);

    return {
      order: createdOrderResonse.data.data,
      payment: confirmedPaymentResponse.data?.data!,
      products: productsResponse.data?.data ?? [],
      mainImageMap: images,
      cart: cartInclShippingResponse.data?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error completing payment");
  }
}

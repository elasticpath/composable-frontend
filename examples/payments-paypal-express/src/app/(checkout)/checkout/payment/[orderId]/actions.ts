"use server";

import {
  confirmPayment,
  createAnAccessToken,
  deleteAllCartItems,
  getOrderTransactions,
} from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "../../../../../lib/create-elastic-path-client";
import { redirect } from "next/navigation";
import { getCartCookieServer } from "../../../../../lib/cart-cookie-server";
import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";

export async function confirmPayPalPayment(
  orderId: string,
  payerId: string | null,
  token: string | null,
) {
  // Validate parameters first
  if (!payerId || !token) {
    redirect(
      `/checkout/payment/error?message=missing-parameters&orderId=${orderId}`,
    );
  }
  const client = createElasticPathClient();
  const clientCredentialsResponse = await createAnAccessToken({
    client,
    body: {
      grant_type: "client_credentials",
      client_id: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
      client_secret: process.env.EPCC_CLIENT_SECRET!,
    },
  });

  if (!clientCredentialsResponse.data) {
    console.error(JSON.stringify(clientCredentialsResponse.error));
    throw new Error("Failed to get client credentials token");
  }

  const transactionResponse = await getOrderTransactions({
    client,
    headers: {
      Authorization: `Bearer ${clientCredentialsResponse.data.access_token}`,
    },
    path: {
      orderID: orderId,
    },
  });

  const relevantTransaction = transactionResponse.data?.data.find(
    (transaction) => transaction.reference === token,
  );

  if (!relevantTransaction) {
    redirect(
      `/checkout/payment/error?message=no-matching-transaction&orderId=${orderId}`,
    );
  }

  const confirmResponse = await confirmPayment({
    client,
    path: {
      orderID: orderId,
      transactionID: relevantTransaction.id!,
    },
    body: {
      data: {
        options: {
          gateway: "paypal_express_checkout",
          method: "purchase",
          payment: payerId,
        },
      },
    },
  });

  if (!confirmResponse.data) {
    console.error("Payment confirmation failed:", confirmResponse.error);
    redirect(
      `/checkout/payment/error?message=payment-confirmation-failed&orderId=${orderId}`,
    );
  }

  const cartId = await getCartCookieServer();
  /**
   * 4. Clear cart on successful payment
   */
  const deleteResponse = await deleteAllCartItems({
    client,
    path: {
      cartID: cartId,
    },
  });

  if (deleteResponse.error) {
    console.error("Failed to clear cart after payment:", deleteResponse.error);
  }

  after(() => {
    // runs after redirect is sent
    revalidateTag("cart");
    revalidatePath("/cart");
  });

  // Success! Redirect to success page
  redirect(`/checkout/payment/success?orderId=${orderId}`);
}

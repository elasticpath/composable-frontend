import { Metadata } from "next";
import { AccountCheckout } from "./AccountCheckout";
import {
  ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  CART_COOKIE_NAME,
} from "../../../lib/cookie-constants";
import { GuestCheckout } from "./GuestCheckout";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckoutViews } from "./CheckoutViews";
import { getAllCurrencies, getACart } from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "../../../lib/create-elastic-path-client";
import { OrderConfirmationProvider } from "./OrderConfirmationProvider";
import { isAccountAuthenticated } from "@epcc-sdk/sdks-nextjs";

export const metadata: Metadata = {
  title: "Checkout",
};
export default async function CheckoutPage() {
  const cartCookie = (await cookies()).get(CART_COOKIE_NAME);
  const client = createElasticPathClient();

  if (!cartCookie) {
    throw new Error("Cart cookie not found");
  }

  const cartResponse = await getACart({
    client,
    path: {
      cartID: cartCookie?.value,
    },
    query: {
      include: ["items"],
    },
  });

  if (!cartResponse.data) {
    notFound();
  }

  const currencies = await getAllCurrencies({
    client,
  });

  const isAccount = await isAccountAuthenticated(
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );
  return (
    <OrderConfirmationProvider>
      <CheckoutViews
        cartResponse={cartResponse.data}
        currencies={currencies.data?.data ?? []}
      >
        {!isAccount ? (
          <GuestCheckout
            cart={cartResponse.data}
            currencies={currencies.data?.data ?? []}
          />
        ) : (
          <AccountCheckout
            cart={cartResponse.data}
            currencies={currencies.data?.data ?? []}
          />
        )}
      </CheckoutViews>
    </OrderConfirmationProvider>
  );
}

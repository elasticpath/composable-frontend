import { Metadata } from "next";
import { AccountCheckout } from "./AccountCheckout";
import { CART_COOKIE_NAME } from "../../../lib/cookie-constants";
import { GuestCheckout } from "./GuestCheckout";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckoutViews } from "./CheckoutViews";
import { getAllCurrencies, getCart } from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "../../(store)/membership/create-elastic-path-client";
import { OrderConfirmationProvider } from "./OrderConfirmationProvider";
import { TAGS } from "../../../lib/constants";
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

  const cartResponse = await getCart({
    client,
    path: {
      cartID: cartCookie?.value,
    },
    query: {
      include: ["items"],
    },
    next: {
      tags: [TAGS.cart],
    },
  });

  if (!cartResponse.data) {
    notFound();
  }

  const currencies = await getAllCurrencies({
    client,
    next: {
      tags: [TAGS.currencies],
    },
  });

  const isAccount = await isAccountAuthenticated();
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

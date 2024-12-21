import { Metadata } from "next";
import { AccountCheckout } from "./AccountCheckout";
import { retrieveAccountMemberCredentials } from "../../../lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../lib/cookie-constants";
import { GuestCheckout } from "./GuestCheckout";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { COOKIE_PREFIX_KEY } from "../../../lib/resolve-cart-env";
import { getEpccImplicitClient } from "../../../lib/epcc-implicit-client";
import { CheckoutProvider } from "./checkout-provider";
import { CheckoutViews } from "./CheckoutViews";

export const metadata: Metadata = {
  title: "Checkout",
};
export default async function CheckoutPage() {
  const cookieStore = cookies();

  const cartCookie = cookieStore.get(`${COOKIE_PREFIX_KEY}_ep_cart`);
  const client = getEpccImplicitClient();

  const cart = await client.Cart(cartCookie?.value).With("items").Get();

  if (!cart) {
    notFound();
  }

  if ((cart.included?.items?.length ?? 0) < 1) {
    redirect("/cart");
  }

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  return (
    <CheckoutProvider>
      <CheckoutViews>
        {!accountMemberCookie ? <GuestCheckout /> : <AccountCheckout />}
      </CheckoutViews>
    </CheckoutProvider>
  );
}

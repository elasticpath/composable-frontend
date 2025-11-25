import { Metadata } from "next";
import { AccountCheckout } from "./AccountCheckout";
import { CART_COOKIE_NAME } from "../../../lib/cookie-constants";
import { GuestCheckout } from "./GuestCheckout";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckoutViews } from "./CheckoutViews";
import { getAllCurrencies, getACart, getByContextProduct } from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "../../../lib/create-elastic-path-client";
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

  const cartResponse = await getACart({
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

  // Fetch product details for each cart item to get original sale price
  const cartItems = cartResponse?.data?.included?.items;
  const productDetailsPromises = cartItems?.map(item =>
    getByContextProduct({
      client,
      path: { product_id: item.product_id! },
    })
  );
  const productDetails = await Promise.all(productDetailsPromises || []);

  // Merge product details into cart items
  const cartItemsWithDetails = cartResponse?.data?.included?.items?.map(item => {
    const productDetail = productDetails.find(pd => pd.data?.data?.id === item.product_id)?.data?.data;
    return {
      ...item,
      productDetail,
    };
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
            cart={{ ...cartResponse.data, included: { items: cartItemsWithDetails } }}
            currencies={currencies.data?.data ?? []}
          />
        ) : (
          <AccountCheckout
            cart={{ ...cartResponse.data, included: { items: cartItemsWithDetails } }}
            currencies={currencies.data?.data ?? []}
          />
        )}
      </CheckoutViews>
    </OrderConfirmationProvider>
  );
}

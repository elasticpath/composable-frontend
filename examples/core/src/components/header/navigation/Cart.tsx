"use server";

import { CartSheet } from "../../cart/CartSheet";
import { createElasticPathClient } from "../../../lib/create-elastic-path-client";
import { cookies } from "next/headers";
import { CART_COOKIE_NAME } from "../../../lib/cookie-constants";
import { getACart, getAllCurrencies, getByContextAllProducts } from "@epcc-sdk/sdks-shopper";
import { TAGS } from "../../../lib/constants";
import { getPreferredCurrency } from "src/lib/i18n";

export async function Cart({ lang }: { lang: string }) {
  const client = createElasticPathClient();
  const cartId = (await cookies()).get(CART_COOKIE_NAME)?.value;

  if (!cartId) {
    console.error("No cart ID found in cookies");
    return null;
  }

  const currencies = await getAllCurrencies({
    client,
    next: {
      tags: [TAGS.currencies],
    },
  });
  const currency = await getPreferredCurrency(lang, currencies.data?.data || []);

  const cartResponse = await getACart({
    client,
    path: {
      cartID: cartId,
    },
    query: {
      include: ["items"],
    },
    next: {
      tags: [TAGS.cart],
    },
    headers: {
      "Accept-Language": lang,
      "X-Moltin-Currency": currency?.code
    }
  });

  const cartCurrency = cartResponse.data?.data?.meta?.display_price?.with_tax?.currency;
  const currencyUpdated = getPreferredCurrency(lang, currencies.data?.data || [], cartCurrency);

  // Fetch product details for each cart item to get original sale price
  const cartItems = cartResponse?.data?.included?.items;
  const productIds = cartItems?.map(item => item.product_id).filter(Boolean);
  const productDetailsResponse = await getByContextAllProducts({
    client,
    query: {
      filter: `in(id,${productIds?.join(",")})`,
    },
    headers: {
      "Accept-Language": lang,
      "X-Moltin-Currency": currencyUpdated?.code,
    }
  });
  const productDetails = productDetailsResponse.data?.data || [];

  // Merge product details into cart items
  const cartItemsWithDetails = cartResponse?.data?.included?.items?.map(item => {
    const productDetail = productDetails.find(pd => pd.id === item.product_id);
    return {
      ...item,
      productDetail,
    };
  });

  if (!cartResponse.data) {
    console.error("No cart found");
    return null;
  }

  return (
    <CartSheet
      cart={{ ...cartResponse.data, included: { items: cartItemsWithDetails } }}
      currencies={currencies?.data?.data ?? []}
    />
  )
}

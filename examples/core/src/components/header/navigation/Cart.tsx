"use server";

import { CartSheet } from "../../cart/CartSheet";
import { createElasticPathClient } from "../../../lib/create-elastic-path-client";
import { cookies } from "next/headers";
import { CART_COOKIE_NAME } from "../../../lib/cookie-constants";
import { getACart, getAllCurrencies, getByContextProduct } from "@epcc-sdk/sdks-shopper";
import { TAGS } from "../../../lib/constants";

export async function Cart() {
  const client = createElasticPathClient();
  const cartId = (await cookies()).get(CART_COOKIE_NAME)?.value;

  if (!cartId) {
    console.error("No cart ID found in cookies");
    return null;
  }

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

  // Fetch currencies
  const currencies = await getAllCurrencies({
    client,
    next: {
      tags: [TAGS.currencies],
    },
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

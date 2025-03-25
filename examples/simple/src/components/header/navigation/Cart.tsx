"use server";

import { CartSheet } from "../../cart/CartSheet";
import { createElasticPathClient } from "../../../app/(store)/membership/create-elastic-path-client";
import { cookies } from "next/headers";
import { CART_COOKIE_NAME } from "../../../lib/cookie-constants";
import { getCart } from "@epcc-sdk/sdks-shopper";
import { TAGS } from "../../../lib/constants";

export async function Cart() {
  const client = createElasticPathClient();
  const cartId = (await cookies()).get(CART_COOKIE_NAME)?.value;

  if (!cartId) {
    console.error("No cart ID found in cookies");
    return null;
  }

  const cartResponse = await getCart({
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

  if (!cartResponse.data) {
    console.error("No cart found");
    return null;
  }

  return <CartSheet cart={cartResponse.data} />;
}

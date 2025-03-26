"use server";
import { manageCarts } from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "./create-elastic-path-client";
import { cookies } from "next/headers";
import { CART_COOKIE_NAME } from "../../../lib/cookie-constants";
import { revalidateTag } from "next/cache";

export async function addToCart({
  offeringId,
  planId,
}: {
  offeringId: string;
  planId: string;
}) {
  const client = createElasticPathClient();
  const cartCookie = (await cookies()).get(CART_COOKIE_NAME);

  if (!cartCookie) {
    throw new Error("Cart cookie not found");
  }

  const result = await manageCarts({
    client,
    path: {
      cartID: cartCookie?.value,
    },
    body: {
      data: {
        type: "subscription_item",
        quantity: 1,
        id: offeringId,
        subscription_configuration: {
          plan: planId,
        },
      },
    },
  });

  revalidateTag("cart");

  return {
    data: result.data,
    error: result.error,
  };
}

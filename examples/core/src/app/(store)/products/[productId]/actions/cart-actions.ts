"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { CART_COOKIE_NAME } from "../../../../../lib/cookie-constants";
import { simpleProductSchema } from "../../../../../components/product/standard/SimpleProductForm";
import {
  manageCarts,
  deleteACartItem,
  updateACartItem,
} from "@epcc-sdk/sdks-shopper";
import { revalidateTag } from "next/cache";
import { createElasticPathClient } from "../../../../../lib/create-elastic-path-client";
import { createBundleFormSchema } from "../../../../../components/product/bundles/validation-schema";
import { formSelectedOptionsToData } from "../../../../../components/product/bundles/form-parsers";

/**
 * addToCartAction - Server Action that adds an item to the cart
 */
export async function addToCartAction(
  data: z.infer<typeof simpleProductSchema>,
) {
  const cartCookie = (await cookies()).get(CART_COOKIE_NAME);

  if (!cartCookie) {
    throw new Error("No cart cookie found. Cannot add product to cart.");
  }

  const client = createElasticPathClient();

  const result = await manageCarts({
    client,
    path: { cartID: cartCookie.value },
    body: {
      data: {
        type: "cart_item",
        id: data.productId,
        quantity: data.quantity,
        ...(data.location && { location: data.location }),
      },
    },
  });

  await revalidateTag("cart");

  return {
    data: result.data,
    error: result.error,
  };
}

/**
 * addToCartAction - Server Action that adds an item to the cart
 */
export async function addToBundleAction(
  data: z.infer<ReturnType<typeof createBundleFormSchema>>,
) {
  const cartCookie = (await cookies()).get(CART_COOKIE_NAME);

  if (!cartCookie) {
    throw new Error("No cart cookie found. Cannot add product to cart.");
  }

  const client = createElasticPathClient();

  const result = await manageCarts({
    client,
    path: { cartID: cartCookie.value },
    body: {
      data: {
        type: "cart_item",
        id: data.productId,
        bundle_configuration: {
          selected_options: formSelectedOptionsToData(data.selectedOptions),
        },
        quantity: data.quantity,
        ...(data.location && { location: data.location }),
      },
    },
  });

  await revalidateTag("cart");

  return {
    data: result.data,
    error: result.error,
  };
}

/**
 * removeCartItemAction - Server Action that removes an item from the cart
 */
export async function removeCartItemAction(data: { cartItemId: string }) {
  const cartCookie = (await cookies()).get(CART_COOKIE_NAME);

  if (!cartCookie) {
    throw new Error("No cart cookie found. Cannot remove product from cart.");
  }

  const client = createElasticPathClient();

  const result = await deleteACartItem({
    client,
    path: { cartID: cartCookie.value, cartitemID: data.cartItemId },
  });

  await revalidateTag("cart");

  return {
    data: result.data,
    error: result.error,
  };
}

/**
 * updateCartItemAction - Server Action to update an item on the cart
 */
export async function updateCartItemAction(data: {
  cartItemId: string;
  quantity: number;
  location?: string;
}) {
  const cartCookie = (await cookies()).get(CART_COOKIE_NAME);

  if (!cartCookie) {
    throw new Error("No cart cookie found. Cannot add product to cart.");
  }

  const client = createElasticPathClient();

  const result = await updateACartItem({
    client,
    path: { cartID: cartCookie.value, cartitemID: data.cartItemId },
    body: {
      data: {
        id: data.cartItemId,
        quantity: data.quantity,
        ...(data.location && { location: data.location }),
      },
    },
  });

  await revalidateTag("cart");
  return {
    data: result.data,
    error: result.error,
  };
}

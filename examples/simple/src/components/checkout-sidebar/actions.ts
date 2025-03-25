"use server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getErrorMessage } from "../../lib/get-error-message";
import { createElasticPathClient } from "../../app/(store)/membership/create-elastic-path-client";
import { manageCarts } from "@epcc-sdk/sdks-shopper";
import { COOKIE_PREFIX_KEY } from "../../lib/cookie-constants";

const applyDiscountSchema = z.object({
  code: z.string(),
});

export async function applyDiscount(formData: FormData) {
  try {
    const client = await createElasticPathClient();

    const cartCookie = (await cookies()).get(
      `${COOKIE_PREFIX_KEY}_ep_cart`,
    )?.value;

    if (!cartCookie) {
      throw new Error("Cart cookie not found");
    }

    const rawEntries = Object.fromEntries(formData.entries());

    const validatedFormData = applyDiscountSchema.safeParse(rawEntries);

    if (!validatedFormData.success) {
      return {
        error: "Invalid code",
      };
    }

    await manageCarts({
      client,
      path: {
        cartID: cartCookie,
      },
      body: {
        data: {
          type: "promotion_item",
          code: validatedFormData.data.code,
        },
      },
    });

    await revalidateTag("cart");
  } catch (error) {
    console.error(error);
    return {
      error: getErrorMessage(error),
    };
  }

  return { success: true };
}

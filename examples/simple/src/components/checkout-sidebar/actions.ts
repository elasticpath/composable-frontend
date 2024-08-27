"use server";
import { getServerSideImplicitClient } from "../../lib/epcc-server-side-implicit-client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { COOKIE_PREFIX_KEY } from "../../lib/resolve-cart-env";
import { getErrorMessage } from "../../lib/get-error-message";
import { manageCarts } from "@epcc-sdk/sdks-shopper";

const applyDiscountSchema = z.object({
  code: z.string(),
});

export async function applyDiscount(formData: FormData) {
  const client = getServerSideImplicitClient();

  const cartCookie = cookies().get(`${COOKIE_PREFIX_KEY}_ep_cart`)?.value;

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

  try {
    await manageCarts({
      client,
      body: {
        data: {
          type: "promotion_item",
          code: validatedFormData.data.code,
        },
      },
      path: {
        cartID: cartCookie,
      },
    });
    revalidatePath("/cart");
  } catch (error) {
    console.error(error);
    return {
      error: getErrorMessage(error),
    };
  }

  return { success: true };
}

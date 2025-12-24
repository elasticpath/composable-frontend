import "server-only";
import { cookies } from "next/headers";
import { COOKIE_PREFIX_KEY } from "./cookie-constants";

const CART_COOKIE_NAME = `${COOKIE_PREFIX_KEY}_ep_cart`;

/**
 * The cart cookie is set by nextjs middleware.
 */
export async function getCartCookieServer(): Promise<string> {
  const possibleCartCookie = (await cookies()).get(CART_COOKIE_NAME);

  if (!possibleCartCookie) {
    throw Error(`Failed to fetch cart cookie! key ${CART_COOKIE_NAME}`);
  }

  return possibleCartCookie.value;
}

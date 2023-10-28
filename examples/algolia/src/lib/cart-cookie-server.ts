import "server-only";
import { COOKIE_PREFIX_KEY } from "./resolve-cart-env";
import { getCookie } from "./get-cookie";

const CART_COOKIE_NAME = `${COOKIE_PREFIX_KEY}_ep_cart`;

/**
 * The cart cookie is set by nextjs middleware.
 */
export function getCartCookieServer(): string {
  const possibleCartCookie = getCookie(CART_COOKIE_NAME);

  if (!possibleCartCookie) {
    throw Error(`Failed to fetch cart cookie! key ${CART_COOKIE_NAME}`);
  }

  return possibleCartCookie.value;
}

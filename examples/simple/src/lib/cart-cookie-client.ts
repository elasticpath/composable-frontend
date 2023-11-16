import { COOKIE_PREFIX_KEY } from "./resolve-cart-env";
import { getCookie } from "cookies-next";

/**
 * The cart cookie is set by nextjs middleware.
 */
export function getCartCookieClient(): string {
  const possibleCartCookie = getCookie(`${COOKIE_PREFIX_KEY}_ep_cart`);

  if (typeof possibleCartCookie === "string") {
    return possibleCartCookie;
  }

  throw Error(
    `Failed to fetch cart cookie! key ${`${COOKIE_PREFIX_KEY}_ep_cart`}`,
  );
}

import { getCookie } from "cookies-next";
import { COOKIE_PREFIX_KEY } from "./resolve-cart-env";
import { ParsedUrlQuery } from "querystring";
import { GetServerSidePropsContext } from "next";
import { parseCookies } from "./parse-cookie";

/**
 * The cart cookie is set by nextjs middleware.
 */
export function getCartCookie<P extends ParsedUrlQuery = ParsedUrlQuery>(
  context?: GetServerSidePropsContext<P>
): string {
  /**
   * Get the cookie if it's set and retrievable through either the context provided or the browsers
   */
  const possibleCartCookie = getCookie(
    `${COOKIE_PREFIX_KEY}_ep_cart`,
    context && {
      req: context.req,
      res: context.res,
    }
  );

  if (typeof possibleCartCookie === "string") {
    return possibleCartCookie;
  }

  /**
   * As a fallback check to see if this is server side and the res header has the cookie set
   *
   * This can happen if the cookie has been set by middleware but not yet been set
   * on the browser.
   */
  const setCookiesHeader = context?.res?.getHeader("set-cookie");
  const possibleResCookie =
    Array.isArray(setCookiesHeader) &&
    parseCookies(setCookiesHeader)[`${COOKIE_PREFIX_KEY}_ep_cart`]?.value;

  if (typeof possibleResCookie === "string") {
    return possibleResCookie;
  }

  throw Error(
    `Failed to fetch cart cookie! key ${`${COOKIE_PREFIX_KEY}_ep_cart`}`
  );
}

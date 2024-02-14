import { expect, Page } from "@playwright/test";

export function getCartId(page: Page) {
  return async function _getCartId(): Promise<string> {
    /* Get the cart id from the cookie */
    const allCookies = await page.context().cookies();
    const cartId = allCookies.find(
      (cookie) => cookie.name === "_store_ep_cart",
    )?.value;

    expect(cartId).toBeDefined();
    return cartId!;
  };
}

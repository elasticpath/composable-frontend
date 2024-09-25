import { InitialState } from "@elasticpath/react-shopper-hooks";
import { buildSiteNavigation } from "@elasticpath/react-shopper-hooks";
import { getCartCookieServer } from "./cart-cookie-server";
import { getCart } from "../services/cart";
import type { Client } from "@epcc-sdk/sdks-shopper";
import { Cart, CartIncluded, ResourceIncluded } from "@elasticpath/js-sdk";

export async function getStoreInitialState(
  client: Client,
): Promise<InitialState> {
  const nav = await buildSiteNavigation(client);

  const cartCookie = getCartCookieServer();

  const cartResponse = await getCart(cartCookie, client);

  if (!cartResponse.response.ok) {
    throw new Error("Failed to get cart");
  }

  const cart = cartResponse.data as ResourceIncluded<Cart, CartIncluded>;

  return {
    cart,
    nav,
  };
}

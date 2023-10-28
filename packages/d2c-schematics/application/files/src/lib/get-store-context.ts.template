import { Moltin } from "@moltin/sdk";
import { StoreContext } from "@elasticpath/react-shopper-hooks";
import { buildSiteNavigation } from "./build-site-navigation";
import { getCartCookieServer } from "./cart-cookie-server";
import { getCart } from "../services/cart";

export async function getStoreContext(client: Moltin): Promise<StoreContext> {
  const nav = await buildSiteNavigation(client);

  const cartCookie = getCartCookieServer();

  const cart = await getCart(cartCookie, client);

  return {
    cart,
    nav,
    type: "store-context-ssr",
  };
}

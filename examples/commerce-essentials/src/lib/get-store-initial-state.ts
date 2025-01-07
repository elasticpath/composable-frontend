import { ElasticPath } from "@elasticpath/js-sdk";
import { InitialState } from "@elasticpath/react-shopper-hooks";
import { buildSiteNavigation } from "./build-site-navigation";
import { getCartCookieServer } from "./cart-cookie-server";
import { getCart } from "../services/cart";

export async function getStoreInitialState(
  client: ElasticPath,
): Promise<InitialState> {
  const nav = await buildSiteNavigation(client);

  const cartCookie = getCartCookieServer();

  const cart = await getCart(cartCookie, client);

  return {
    cart,
    nav,
  };
}

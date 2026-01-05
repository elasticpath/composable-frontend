import { buildSiteNavigation } from "./build-site-navigation";
import { getCartCookieServer } from "./cart-cookie-server";
import { getACart, Client } from "@epcc-sdk/sdks-shopper";

export type InitialState = Awaited<ReturnType<typeof getStoreInitialState>>;

export async function getStoreInitialState(client: Client) {
  const nav = await buildSiteNavigation(client);

  const cartCookie = await getCartCookieServer();

  const cart = await getACart({
    client,
    path: {
      cartID: cartCookie,
    },
    query: {
      include: ["items"],
    },
  });

  return {
    cart: cart.data?.data,
    nav,
  };
}

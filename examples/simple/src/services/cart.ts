import {
  client as elasticPathClient,
  getCart as getCartClient,
} from "@epcc-sdk/sdks-shopper";

export async function getCart(
  cartId: string,
  client?: typeof elasticPathClient,
) {
  return await getCartClient({
    client,
    path: {
      cartID: cartId,
    },
    query: {
      include: "items",
    },
  });
}

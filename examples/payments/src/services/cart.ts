import type { Moltin as EPCCClient } from "@moltin/sdk";
import { Cart, CartIncluded, ResourceIncluded } from "@moltin/sdk";

export async function getCart(
  cartId: string,
  client: EPCCClient,
): Promise<ResourceIncluded<Cart, CartIncluded>> {
  return client.Cart(cartId).With("items").Get();
}

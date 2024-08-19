import type {ElasticPath } from "@elasticpath/js-sdk";
import { Cart, CartIncluded, ResourceIncluded } from "@elasticpath/js-sdk";

export async function getCart(
  cartId: string,
  client: ElasticPath,
): Promise<ResourceIncluded<Cart, CartIncluded>> {
  return client.Cart(cartId).With("items").Get();
}

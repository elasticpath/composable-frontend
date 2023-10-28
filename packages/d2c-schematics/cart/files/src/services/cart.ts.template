import type { Moltin as EPCCClient } from "@moltin/sdk";
import { Cart, CartIncluded, ResourceIncluded } from "@moltin/sdk";

export interface CustomItemRequest {
  type: "custom_item";
  name: string;
  quantity: number;
  price: {
    amount: number;
    includes_tax?: boolean;
  };
  sku?: string;
  description?: string;
  custom_inputs?: Record<string, any>;
}

export async function getCart(
  cartId: string,
  client: EPCCClient,
): Promise<ResourceIncluded<Cart, CartIncluded>> {
  return client.Cart(cartId).With("items").Get();
}

"use client";
import { useMutation } from "@tanstack/react-query";
import { useCart } from "@elasticpath/react-shopper-hooks";
import { getEpccImplicitClient } from "../lib/epcc-implicit-client";

interface AddSubscriptionRequest {
  offeringId: string;
  planId: string;
  quantity?: number;
}

export function useCartAddSubscription() {
  const { data } = useCart();
  const client = getEpccImplicitClient();
  // console.log(`data: ${JSON.stringify(data, null, 2)}`);
  // console.log(`elasticPath: ${JSON.stringify(elasticPath, null, 2)}`);

  return useMutation({
    mutationFn: async ({ offeringId, planId, quantity = 1 }: AddSubscriptionRequest) => {
      if (!data?.cartId) throw new Error("No cart available");
      if (!client) throw new Error("No client available");
      console.log(`client: ${JSON.stringify(client.Cart(data.cartId), null, 2)}`);
      // @ts-ignore - SDK types are not up to date
      const response = await client.request.send(
        `/carts/${data.cartId}/items`,
        "POST",
        {
          data: {
            type: "subscription_item",
            id: offeringId,
            quantity: quantity,
            subscription_configuration: {
              plan: planId
            }
          }
        },
        undefined,
        client,
        false,
        "v2",
        undefined,
      );
      //console.log(`response: ${JSON.stringify(response, null, 2)}`);
      return response;
    }
  });
}
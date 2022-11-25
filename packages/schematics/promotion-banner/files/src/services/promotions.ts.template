import type { Promotion, Resource } from "@moltin/sdk";
import { epccServerClient } from "../lib/epcc-server-client";

/**
 * Get a promotion by id
 *
 * This function will only work server side as Promotions requires a client_credentials token
 */
export async function getPromotionById(
  promotionId: string
): Promise<Resource<Promotion>> {
  return await epccServerClient.Promotions.Get(promotionId);
}

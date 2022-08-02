import type { Promotion, Resource } from "@moltin/sdk";
import { EPCCAPI } from "./helper";

/**
 * Get a promotion by id
 *
 * This function will only work server side as Promotions requires a client_credentials token
 */
export async function getPromotionById(
  promotionId: string
): Promise<Resource<Promotion>> {
  return await EPCCAPI.Promotions.Get(promotionId);
}

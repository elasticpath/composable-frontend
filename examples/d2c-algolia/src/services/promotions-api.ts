import type { Promotion, Resource } from "@moltin/sdk";

export async function getPromotionById(
  id: string
): Promise<Resource<Promotion>> {
  return fetch(`/api/promotions/${id}`).then((resp) => resp.json());
}

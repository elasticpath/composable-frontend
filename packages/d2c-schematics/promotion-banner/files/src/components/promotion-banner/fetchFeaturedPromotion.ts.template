// Fetching the data for a specific promotion for the home page promotion-banner
import { getPromotionById } from "../../services/promotions";

export const fetchFeaturedPromotion = async (PROMOTION_ID: string) => {
  const { data } = await getPromotionById(PROMOTION_ID);
  return data;
};

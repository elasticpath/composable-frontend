'use server';

import { addSubscriptionToCart } from '@/app/actions/cart';

export async function addMembershipToCart(offeringId: string, planId: string, pricingOptionId: string) {
  return addSubscriptionToCart(offeringId, planId, pricingOptionId);
}

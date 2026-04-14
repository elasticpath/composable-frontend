import {
  type GetOfferingResponse,
  type OfferingPlan,
  type OfferingPricingOption,
  type OfferingFeature
} from '@epcc-sdk/sdks-shopper';

export function getPlans(offering: GetOfferingResponse | null): OfferingPlan[] {
  return offering?.included?.plans || [];
}

export function getPricingOptions(offering: GetOfferingResponse | null): OfferingPricingOption[] {
  return offering?.included?.pricing_options || [];
}

export function getFeatures(offering: GetOfferingResponse | null): OfferingFeature[] {
  return offering?.included?.features || [];
}

export function getPlanById(offering: GetOfferingResponse | null, planId: string): OfferingPlan | undefined {
  const plans = getPlans(offering);
  return plans.find(plan => plan.id === planId);
}

export function getPricingOptionById(offering: GetOfferingResponse | null, pricingOptionId: string): OfferingPricingOption | undefined {
  const pricingOptions = getPricingOptions(offering);
  return pricingOptions.find(option => option.id === pricingOptionId);
}

export function getPricingOptionsForPlan(offering: GetOfferingResponse | null, plan: OfferingPlan): OfferingPricingOption[] {
  const relationships = plan.relationships as any;
  if (!relationships?.pricing_options?.data) return [];

  const allPricingOptions = getPricingOptions(offering);
  const planPricingOptionIds = relationships.pricing_options.data.map((po: any) => po.id);

  return allPricingOptions.filter(option =>
    option.id && planPricingOptionIds.includes(option.id)
  );
}

export function getPlansForPricingOption(offering: GetOfferingResponse | null, pricingOptionId: string): OfferingPlan[] {
  const plans = getPlans(offering);

  return plans.filter(plan => {
    const relationships = plan.relationships as any;
    if (!relationships?.pricing_options?.data) return false;
    return relationships.pricing_options.data.some((po: any) => po.id === pricingOptionId);
  });
}

export function formatPrice(plan: OfferingPlan): string {
  if (!plan.meta?.prices) return '£9.99';

  const firstPriceKey = Object.keys(plan.meta.prices)[0];
  if (!firstPriceKey) return '£9.99';

  const priceData = plan.meta.prices[firstPriceKey];
  const displayPrice = priceData?.display_price?.with_tax || priceData?.display_price?.without_tax;

  if (displayPrice?.formatted) {
    return displayPrice.formatted;
  }

  return '£9.99';
}

export function formatPriceForPricingOption(plan: OfferingPlan, pricingOption: OfferingPricingOption): string {
  if (!pricingOption.meta?.prices || !plan.id) return '£9.99';

  const priceData = pricingOption.meta.prices[plan.id];
  if (!priceData) return '£9.99';

  const displayPrice = priceData.display_price?.without_tax || priceData.display_price?.with_tax;

  if (displayPrice?.formatted) {
    return displayPrice.formatted;
  }

  if (displayPrice?.amount) {
    const amount = Number(displayPrice.amount) / 100;
    return `£${amount.toFixed(2)}`;
  }

  return '£9.99';
}

export function formatInterval(plan: OfferingPlan): string {
  return 'year';
}

export function formatPricingOptionInterval(pricingOption: OfferingPricingOption): string {
  if (!pricingOption.attributes) return 'year';

  const { billing_interval_type, billing_frequency } = pricingOption.attributes;

  if (billing_frequency === 1) {
    return billing_interval_type;
  }

  return `${billing_frequency} ${billing_interval_type}s`;
}
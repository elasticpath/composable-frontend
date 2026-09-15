import type { ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { formatCurrency } from "./format-currency";

const DEFAULT_CURRENCY: ResponseCurrency = { code: "USD", decimal_places: 2 };

type PricedHit = {
  attributes?: {
    price?: Record<string, { amount?: number } | undefined>;
    [key: string]: unknown;
  };
  meta?: {
    display_price?: {
      with_tax?: { currency?: string; formatted?: string };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/**
 * The price a search result card should show.
 *
 * A card stands for the variant currently selected on it, so that variant's own
 * price wins. Otherwise the family's price is used.
 *
 * Returns `undefined` when the catalogue prices the product nowhere. A card that
 * renders $0.00 in that case states a price the shopper cannot buy at, and the
 * caller is better placed to decide what to show instead of a number.
 */
export function resolveCardPrice({
  hit,
  variantPrice,
  preferredCurrency,
}: {
  hit?: PricedHit | null;
  variantPrice?: string;
  preferredCurrency?: ResponseCurrency;
}): string | undefined {
  if (variantPrice) {
    return variantPrice;
  }

  const currency = preferredCurrency ?? DEFAULT_CURRENCY;
  const displayPrice = hit?.meta?.display_price?.with_tax;

  if (displayPrice?.currency === currency.code && displayPrice?.formatted) {
    return displayPrice.formatted;
  }

  const amount = hit?.attributes?.price?.[currency.code!]?.amount;

  // A zero price is a real price; a missing one is not.
  return typeof amount === "number" ? formatCurrency(amount, currency) : undefined;
}

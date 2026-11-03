import type { ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { formatCurrency } from "./format-currency";

const DEFAULT_CURRENCY: ResponseCurrency = { code: "USD", decimal_places: 2 };

type DisplayPrice = {
  currency?: string;
  formatted?: string;
};

type PricedHit = {
  attributes?: {
    price?: Record<string, { amount?: number } | undefined>;
    [key: string]: unknown;
  };
  meta?: {
    display_price?: {
      without_tax?: DisplayPrice;
      with_tax?: DisplayPrice;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/** Undefined when the catalogue prices the product nowhere, so callers can show nothing. */
export function resolveCardPrice({
  hit,
  preferredCurrency,
}: {
  hit?: PricedHit | null;
  preferredCurrency?: ResponseCurrency;
}): string | undefined {
  const currency = preferredCurrency ?? DEFAULT_CURRENCY;

  // `without_tax` first, matching ProductSummary and the variant lookup, so a
  // family card and a standard card never quote different tax bases.
  const displayPrice =
    hit?.meta?.display_price?.without_tax ?? hit?.meta?.display_price?.with_tax;

  if (displayPrice?.currency === currency.code && displayPrice?.formatted) {
    return displayPrice.formatted;
  }

  const amount = hit?.attributes?.price?.[currency.code!]?.amount;

  // A zero price is a real price; a missing one is not.
  return typeof amount === "number" ? formatCurrency(amount, currency) : undefined;
}

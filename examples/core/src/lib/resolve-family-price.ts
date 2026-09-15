/** Any variant; this module reads only what it needs to compare prices. */
type PricedVariant = {
  amount?: number;
  formattedPrice?: string;
  [key: string]: unknown;
};

type Priced = {
  amount: number;
  formattedPrice: string;
};

/**
 * The price a search result card shows while it stands for the whole family,
 * before the shopper has picked a variant.
 *
 * Always drawn from the variants themselves, never from the parent product: a
 * parent can carry a price that no variant has — one catalogue prices a parent
 * at $20.00 whose variants run $10.00 to $15.00 — so quoting the parent states
 * a price the shopper cannot buy at.
 *
 * Returns `undefined` when no variant is priced, so the caller can show nothing
 * rather than invent a number.
 */
export function resolveFamilyPrice(
  variants: PricedVariant[],
): string | undefined {
  const priced = variants.reduce<Priced[]>((acc, variant) => {
    if (
      typeof variant?.amount === "number" &&
      typeof variant?.formattedPrice === "string" &&
      variant.formattedPrice.length > 0
    ) {
      acc.push({ amount: variant.amount, formattedPrice: variant.formattedPrice });
    }
    return acc;
  }, []);

  if (priced.length === 0) {
    return undefined;
  }

  const cheapest = priced.reduce((lowest, variant) =>
    variant.amount < lowest.amount ? variant : lowest,
  );
  const everyPriceMatches = priced.every(
    (variant) => variant.amount === cheapest.amount,
  );

  return everyPriceMatches
    ? cheapest.formattedPrice
    : `from ${cheapest.formattedPrice}`;
}

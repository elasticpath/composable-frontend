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
 * Drawn from the variants, never the parent: a parent can carry a price no
 * variant has, such as a $20.00 parent whose variants run $10.00 to $15.00.
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

type PricedVariant = {
  amount?: number;
  formattedPrice?: string;
  currency?: string;
  [key: string]: unknown;
};

export type FamilyPrice = {
  formatted: string;
  /** The cheapest known price is a floor, not a price every variant charges. */
  isFrom: boolean;
};

/** The one place a price becomes display text, so the card and the product page agree. */
export function formatFamilyPrice(price: FamilyPrice): string {
  return price.isFrom ? `from ${price.formatted}` : price.formatted;
}

/** A variant can only be quoted or compared in the currency being displayed. */
export function isInCurrency(
  variant: { currency?: string } | undefined,
  currency?: string,
): boolean {
  return !currency || variant?.currency === currency;
}

/**
 * Drawn from the variants, never the parent: a parent can carry a price no
 * variant has, such as a $20.00 parent whose variants run $10.00 to $15.00.
 *
 * `isFrom` is set when the variants differ, and also when any of them has no
 * price — an unpriced variant could undercut the ones we know about.
 */
export function resolveFamilyPrice(
  variants: PricedVariant[],
  currency?: string,
): FamilyPrice | undefined {
  const comparable = variants.filter((variant) => isInCurrency(variant, currency));

  const priced = comparable.reduce<Array<{ amount: number; formatted: string }>>(
    (acc, variant) => {
      if (
        typeof variant?.amount === "number" &&
        typeof variant?.formattedPrice === "string" &&
        variant.formattedPrice.length > 0
      ) {
        acc.push({ amount: variant.amount, formatted: variant.formattedPrice });
      }
      return acc;
    },
    [],
  );

  if (priced.length === 0) {
    return undefined;
  }

  const cheapest = priced.reduce((lowest, variant) =>
    variant.amount < lowest.amount ? variant : lowest,
  );

  return {
    formatted: cheapest.formatted,
    // Any variant we could not price — no price at all, or one in another
    // currency — might undercut the ones we can, so the price is a floor.
    isFrom:
      priced.length < variants.length ||
      priced.some((variant) => variant.amount !== cheapest.amount),
  };
}

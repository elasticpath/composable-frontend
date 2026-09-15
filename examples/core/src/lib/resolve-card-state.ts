import { getSkuIdFromOptions } from "./product-helper";
import {
  collectVariantProductIds,
  getDefaultSelection,
  type FamilyVariation,
  type VariationMatrix,
} from "./product-family";
import {
  isInCurrency,
  resolveFamilyPrice,
  type FamilyPrice,
} from "./resolve-family-price";

type Variant = {
  id: string;
  slug?: string;
  formattedPrice?: string;
  amount?: number;
  currency?: string;
  mainImageId?: string;
};

export type CardState = {
  /** Set once every variation has an option and that variant is known. */
  selectedVariant?: Variant;
  /** Stands in for the family's picture while nothing is chosen. */
  representativeVariant?: Variant;
  price?: FamilyPrice;
};

/**
 * What a search result card should show: the variant it stands for, and the
 * price to quote.
 *
 * A chosen variant the catalogue does not price yields no price at all. Falling
 * back to the family price there would quote a number the shopper cannot buy
 * the thing they just chose at.
 */
export function resolveCardState({
  variations,
  matrix,
  variants,
  selectedOptionIds,
  currency,
}: {
  variations: FamilyVariation[];
  matrix?: VariationMatrix;
  variants: Record<string, Variant>;
  selectedOptionIds: Array<string | undefined>;
  currency?: string;
}): CardState {
  if (variations.length === 0) {
    return {};
  }

  const representativeId = matrix
    ? getSkuIdFromOptions(getDefaultSelection(variations), matrix)
    : undefined;
  const representativeVariant = representativeId
    ? variants[representativeId]
    : undefined;

  const fullSelection = selectedOptionIds.every(isString)
    ? selectedOptionIds
    : undefined;

  if (fullSelection && matrix) {
    const selectedId = getSkuIdFromOptions(fullSelection, matrix);
    const selectedVariant = selectedId ? variants[selectedId] : undefined;

    // The same currency rule the family price applies: a variant priced in
    // another currency is not quotable here either.
    const quotable =
      selectedVariant?.formattedPrice &&
      isInCurrency(selectedVariant, currency);

    return {
      selectedVariant,
      representativeVariant,
      price: quotable
        ? { formatted: selectedVariant!.formattedPrice!, isFrom: false }
        : undefined,
    };
  }

  const familyVariants = collectVariantProductIds([{ meta: { variation_matrix: matrix } }])
    .map((id) => variants[id] ?? { id });

  return {
    representativeVariant,
    price: resolveFamilyPrice(familyVariants, currency),
  };
}

function isString(value: string | undefined): value is string {
  return typeof value === "string";
}

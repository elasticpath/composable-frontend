import type { Variation, VariationOption } from "@epcc-sdk/sdks-shopper";
import { sortBySortOrder } from "./sort-by-sort-order";

export const EXCLUDE_CHILD_PRODUCTS_FILTER = "meta.product_types:!=child";

export type FamilyVariationOption = {
  id: string;
  name: string;
};

export type FamilyVariation = {
  id: string;
  name: string;
  options: FamilyVariationOption[];
};

/** The index types a hit's `meta` as an arbitrary document, so check at runtime. */
type VariationCarryingHit = {
  meta?: {
    variations?: unknown;
    variation_matrix?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/** One level of `meta.variation_matrix`; a leaf is a child product id. */
export type VariationMatrix = {
  [optionId: string]: VariationMatrix | string;
};

export function getFamilyVariations(
  hit: VariationCarryingHit | null | undefined,
): FamilyVariation[] {
  const variations = hit?.meta?.variations;

  if (!Array.isArray(variations)) {
    return [];
  }

  return sortBySortOrder(variations as Variation[])
    .map((variation) => ({
      id: resolveId(variation),
      name: variation?.name,
      options: toFamilyOptions(variation?.options),
    }))
    .filter(
      (variation): variation is FamilyVariation =>
        isNonEmptyString(variation.name) && variation.options.length > 0,
    );
}

function toFamilyOptions(
  options: Array<VariationOption> | undefined,
): FamilyVariationOption[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return sortBySortOrder(options)
    .map((option) => ({ id: resolveId(option), name: option?.name }))
    .filter((option): option is FamilyVariationOption =>
      isNonEmptyString(option.name),
    );
}

/** The id is only a render key, so a labelled entry without one is still usable. */
function resolveId(entry: { id?: string; name?: string }): string {
  return isNonEmptyString(entry?.id) ? entry.id : (entry?.name as string);
}

export function getVariationMatrix(
  hit: VariationCarryingHit | null | undefined,
): VariationMatrix | undefined {
  const matrix = hit?.meta?.variation_matrix;
  return isMatrixNode(matrix) && typeof matrix !== "string" ? matrix : undefined;
}

export function collectVariantProductIds(
  hits: Array<VariationCarryingHit | null | undefined>,
): string[] {
  const ids = new Set<string>();

  for (const hit of hits) {
    collectMatrixLeaves(getVariationMatrix(hit), ids);
  }

  return [...ids];
}

export function getDefaultSelection(variations: FamilyVariation[]): string[] {
  return variations
    .map((variation) => variation.options[0]?.id)
    .filter(isNonEmptyString);
}

function collectMatrixLeaves(
  node: VariationMatrix | string | undefined,
  into: Set<string>,
): void {
  if (typeof node === "string") {
    if (node.length > 0) into.add(node);
    return;
  }
  if (!node) return;

  for (const child of Object.values(node)) {
    collectMatrixLeaves(child as VariationMatrix | string, into);
  }
}

function isMatrixNode(value: unknown): value is VariationMatrix | string {
  return (
    typeof value === "string" ||
    (typeof value === "object" && value !== null && !Array.isArray(value))
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

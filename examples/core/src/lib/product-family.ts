import type { Variation, VariationOption } from "@epcc-sdk/sdks-shopper";
import { sortBySortOrder } from "./sort-by-sort-order";

/**
 * Catalog Search `filter_by` expression that removes child products from a
 * result set, leaving one hit per product family.
 *
 * A parent product carries the family's whole option set in `meta.variations`,
 * so a card can describe the family without its children being in the results.
 * The trade-off: data held only on a child product no longer matches a search.
 */
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

/**
 * The part of a Catalog Search hit this module reads. The index models a hit's
 * `meta` as an arbitrary document (see `CatalogSearchProduct`), so the contents
 * are checked at runtime rather than trusted from the type.
 */
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

/**
 * Reads the option set a product family offers from a search hit.
 *
 * Returns an empty array for anything that is not a parent product — a standard
 * product, a bundle, or a hit the index returned without variation data.
 */
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

/**
 * The name stands in when the index gives an entry no id. The id is only ever
 * a key for the rendered list, so a labelled option is worth keeping either way.
 */
function resolveId(entry: { id?: string; name?: string }): string {
  return isNonEmptyString(entry?.id) ? entry.id : (entry?.name as string);
}

/**
 * The parent's map from variation options to the child product they select.
 *
 * A family with one variation maps option id to product id. A family with more
 * maps one level per variation, so the leaves sit as deep as there are axes.
 */
export function getVariationMatrix(
  hit: VariationCarryingHit | null | undefined,
): VariationMatrix | undefined {
  const matrix = hit?.meta?.variation_matrix;
  return isMatrixNode(matrix) && typeof matrix !== "string" ? matrix : undefined;
}

/**
 * Every child product the families on a page of search results can resolve to.
 *
 * The card needs each variant's own price and image, and the search response
 * carries neither — it holds parents only. These ids are what lets one batched
 * query fetch the lot, however many families the page holds.
 */
export function collectVariantProductIds(
  hits: Array<VariationCarryingHit | null | undefined>,
): string[] {
  const ids = new Set<string>();

  for (const hit of hits) {
    collectMatrixLeaves(getVariationMatrix(hit), ids);
  }

  return [...ids];
}

/**
 * The option to show selected when a card first renders: the first of each
 * variation. A family's variants can be priced differently, so a card has to
 * stand for one of them — showing the parent's price quotes a number the
 * shopper may not be able to buy at.
 */
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

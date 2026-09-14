import type { Variation, VariationOption } from "@epcc-sdk/sdks-shopper";

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
    [key: string]: unknown;
  };
  [key: string]: unknown;
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
 * Orders by the merchandiser's `sort_order`, keeping index order for entries
 * that do not have one. `Array.prototype.sort` is stable, so the entries
 * without a `sort_order` stay in the order the index returned them.
 *
 * `components/product/bundles/sort-by-order.ts` sorts bundle options by the
 * same field but puts a missing — and a zero — `sort_order` first. Variation
 * options use zero as a real position, so they need this ordering instead.
 */
function sortBySortOrder<T extends { sort_order?: number | null }>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) => resolveSortOrder(a) - resolveSortOrder(b));
}

function resolveSortOrder(entry: { sort_order?: number | null }): number {
  return typeof entry?.sort_order === "number"
    ? entry.sort_order
    : Number.MAX_SAFE_INTEGER;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

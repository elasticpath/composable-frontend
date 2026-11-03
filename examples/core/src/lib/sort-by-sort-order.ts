type Sortable = {
  sort_order?: number | null;
  name?: string;
};

/**
 * Unordered entries fall back to their name because the API order is not stable
 * between calls. Zero is a real position here (`sm` is 0), unlike in
 * `components/product/bundles/sort-by-order.ts`, which sorts zero first.
 */
export function sortBySortOrder<T extends Sortable>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const bySortOrder = resolveSortOrder(a) - resolveSortOrder(b);
    if (bySortOrder !== 0) {
      return bySortOrder;
    }
    return compareNames(a, b);
  });
}

function resolveSortOrder(entry: Sortable): number {
  return typeof entry?.sort_order === "number"
    ? entry.sort_order
    : Number.MAX_SAFE_INTEGER;
}

function compareNames(a: Sortable, b: Sortable): number {
  if (typeof a?.name !== "string" || typeof b?.name !== "string") {
    return 0;
  }
  return a.name.localeCompare(b.name);
}

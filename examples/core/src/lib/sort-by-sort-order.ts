/**
 * Orders variations and variation options the way the merchandiser set them up.
 *
 * Entries without a `sort_order` keep the order the API returned them in:
 * `Array.prototype.sort` is stable, and every entry without one compares equal.
 *
 * `components/product/bundles/sort-by-order.ts` sorts bundle component options
 * by the same field, but treats a missing — and a zero — `sort_order` as "first".
 * Variation options use zero as a real position (`sm` is 0, `md` 1, `lg` 2), so
 * they need this ordering instead.
 */
export function sortBySortOrder<T extends { sort_order?: number | null }>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) => resolveSortOrder(a) - resolveSortOrder(b));
}

function resolveSortOrder(entry: { sort_order?: number | null }): number {
  return typeof entry?.sort_order === "number"
    ? entry.sort_order
    : Number.MAX_SAFE_INTEGER;
}

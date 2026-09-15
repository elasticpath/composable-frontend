type Sortable = {
  sort_order?: number | null;
  name?: string;
};

/**
 * Orders variations and variation options the way the merchandiser set them up.
 *
 * Entries the merchandiser has not ordered fall back to their name, because the
 * API does not guarantee a stable order between calls — without the tie-break,
 * a product whose variations carry no `sort_order` renders its rows in a
 * different order from one request to the next.
 *
 * `components/product/bundles/sort-by-order.ts` sorts bundle component options
 * by the same field, but treats a missing — and a zero — `sort_order` as "first".
 * Variation options use zero as a real position (`sm` is 0, `md` 1, `lg` 2), so
 * they need this ordering instead.
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

/**
 * Entries without a name compare equal, so a stable sort keeps them where the
 * API put them — there is nothing better to order them by.
 */
function compareNames(a: Sortable, b: Sortable): number {
  if (typeof a?.name !== "string" || typeof b?.name !== "string") {
    return 0;
  }
  return a.name.localeCompare(b.name);
}

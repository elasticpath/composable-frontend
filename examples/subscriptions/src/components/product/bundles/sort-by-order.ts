export function sortByOrder(
  { sort_order: a }: { sort_order?: number | null },
  { sort_order: b }: { sort_order?: number | null },
): number {
  return a || b ? (!a ? -1 : !b ? 1 : a - b) : 0;
}

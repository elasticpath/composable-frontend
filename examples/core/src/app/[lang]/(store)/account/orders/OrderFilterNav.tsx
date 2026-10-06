import { LocaleLink } from "src/components/LocaleLink";
import { cn } from "src/lib/cn";
import {
  ORDER_FILTER_LABELS,
  ORDER_FILTERS,
  OrderFilter,
  orderFilterHref,
} from "src/lib/order-filter";

export function OrderFilterNav({
  selected,
  searchParams,
}: {
  selected: OrderFilter;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <nav aria-label="Filter orders">
      <ul role="list" className="flex flex-wrap gap-2">
        {ORDER_FILTERS.map((filter) => {
          const isSelected = filter === selected;
          return (
            <li key={filter}>
              <LocaleLink
                href={orderFilterHref(searchParams, filter)}
                aria-current={isSelected ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-black/20 text-black hover:border-black/60",
                )}
              >
                {ORDER_FILTER_LABELS[filter]}
              </LocaleLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

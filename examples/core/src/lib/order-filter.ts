export const ORDER_FILTERS = ["all", "complete", "payment-pending"] as const;

export type OrderFilter = (typeof ORDER_FILTERS)[number];

export type OrderListSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const ORDER_LIST_PATH = "/account/orders";

export const ORDER_FILTER_DETAILS: Record<
  OrderFilter,
  { label: string; apiFilter?: string; emptyMessage: string }
> = {
  all: {
    label: "All orders",
    emptyMessage: "You have no orders yet.",
  },
  complete: {
    label: "Complete",
    apiFilter: "eq(status,complete)",
    emptyMessage: "You have no complete orders.",
  },
  "payment-pending": {
    label: "Payment pending",
    apiFilter: "eq(payment,unpaid)",
    emptyMessage: "You have no orders waiting on payment.",
  },
};

export function orderFilterFromSearchParam(
  value: string | string[] | undefined,
): OrderFilter {
  const first = Array.isArray(value) ? value[0] : value;
  return ORDER_FILTERS.find((filter) => filter === first) ?? "all";
}

export function orderListApiFilter(filter: OrderFilter): string | undefined {
  return ORDER_FILTER_DETAILS[filter].apiFilter;
}

export function orderFilterHref(
  current: OrderListSearchParams,
  filter: OrderFilter,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (key === "filter" || key === "offset" || value === undefined) continue;
    for (const repeatedValue of Array.isArray(value) ? value : [value]) {
      params.append(key, repeatedValue);
    }
  }
  if (filter !== "all") params.set("filter", filter);
  const query = params.toString();
  return query ? `${ORDER_LIST_PATH}?${query}` : ORDER_LIST_PATH;
}

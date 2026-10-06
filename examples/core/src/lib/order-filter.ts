export const ORDER_FILTERS = ["all", "complete", "payment-pending"] as const;

export type OrderFilter = (typeof ORDER_FILTERS)[number];

const API_FILTERS: Record<OrderFilter, string | undefined> = {
  all: undefined,
  complete: "eq(status,complete)",
  "payment-pending": "eq(payment,unpaid)",
};

export function orderFilterFromSearchParam(
  value: string | string[] | undefined,
): OrderFilter {
  const first = Array.isArray(value) ? value[0] : value;
  return ORDER_FILTERS.find((filter) => filter === first) ?? "all";
}

export function orderListApiFilter(filter: OrderFilter): string | undefined {
  return API_FILTERS[filter];
}

const ORDER_LIST_PATH = "/account/orders";

export function orderFilterHref(
  current: Record<string, string | string[] | undefined>,
  filter: OrderFilter,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (key === "filter" || key === "offset" || value === undefined) continue;
    for (const each of Array.isArray(value) ? value : [value]) {
      params.append(key, each);
    }
  }
  if (filter !== "all") params.set("filter", filter);
  const query = params.toString();
  return query ? `${ORDER_LIST_PATH}?${query}` : ORDER_LIST_PATH;
}

export const ORDER_FILTER_LABELS: Record<OrderFilter, string> = {
  all: "All orders",
  complete: "Complete",
  "payment-pending": "Payment pending",
};

export function paymentStatusLabel(
  payment: string | undefined,
): string | undefined {
  if (!payment) return undefined;
  if (payment === "unpaid") return ORDER_FILTER_LABELS["payment-pending"];
  const words = payment.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

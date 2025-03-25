import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";

export function formatCurrency(
  amount: number,
  currency: ResponseCurrency,
  options: {
    locals?: Parameters<typeof Intl.NumberFormat>[0];
  } = { locals: "en-US" },
) {
  const { decimal_places = 2, code } = currency;

  const resolvedAmount = amount / Math.pow(10, decimal_places);

  return new Intl.NumberFormat(options.locals, {
    style: "currency",
    maximumFractionDigits: decimal_places,
    minimumFractionDigits: decimal_places,
    currency: code,
  }).format(resolvedAmount);
}

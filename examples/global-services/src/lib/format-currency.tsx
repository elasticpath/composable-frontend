import { Currency } from "@elasticpath/js-sdk";

export function formatCurrency(
  amount: number,
  currency: Currency,
  options: {
    locals?: Parameters<typeof Intl.NumberFormat>[0];
  } = { locals: "en-US" },
) {
  const { decimal_places, code } = currency;

  const resolvedAmount = amount / Math.pow(10, decimal_places);

  return new Intl.NumberFormat(options.locals, {
    style: "currency",
    maximumFractionDigits: decimal_places,
    minimumFractionDigits: decimal_places,
    currency: code,
  }).format(resolvedAmount);
}

import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";

export function formatCurrency(
  amount: number,
  currency: ResponseCurrency,
  options: {
    locals?: Parameters<typeof Intl.NumberFormat>[0];
  } = { locals: "en-US" },
) {
  const {
    decimal_places = 2,
    decimal_point = ".",
    thousand_separator = ",",
    format = "{price} {code}",
    code,
  } = currency;

  const resolvedAmount = amount / Math.pow(10, decimal_places);

  const [integerPart, decimalPartRaw] = resolvedAmount
    .toFixed(decimal_places)
    .split(".");

  const integerWithGrouping = integerPart?.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousand_separator
  );

  const formattedNumber = `${integerWithGrouping}${decimal_point}${decimalPartRaw}`;
  
  const isNegative = resolvedAmount < 0;

  const absoluteFormattedNumber = formattedNumber.replace(/^-/, "");

  let finalFormatted = format
    .replace("{price}", absoluteFormattedNumber)
    .replace("{code}", code ?? "");

  if (isNegative) {
    finalFormatted = `-${finalFormatted}`;
  }

  return finalFormatted || new Intl.NumberFormat(options.locals, {
    style: "currency",
    maximumFractionDigits: decimal_places,
    minimumFractionDigits: decimal_places,
    currency: code,
  }).format(resolvedAmount);
}

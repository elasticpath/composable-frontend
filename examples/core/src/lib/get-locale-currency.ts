import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { LOCALE_TO_CURRENCY } from "./i18n";

export function getPreferredCurrency(lang: string | undefined, currencies: ResponseCurrency[], cartCurrencyCode?: string) {
  if (!currencies.length) return undefined;

  const preferredCode = cartCurrencyCode
    ? cartCurrencyCode
    : lang
      ? LOCALE_TO_CURRENCY[lang]
      : undefined

  let currency = currencies.find((c: any) => c.code === preferredCode && c.enabled)

  if (!currency) {
    currency = currencies.find((c: any) => c.default && c.enabled);
  }

  return currency;
}
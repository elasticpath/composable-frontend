import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";

export const SUPPORTED_LOCALES = ["en", "fr", "de", "es", "en-GB"];

export const LOCALE_TO_CURRENCY: Record<string, string> = {
  en: "USD",
  fr: "EUR",
  de: "EUR",
  "en-GB": "GBP",
};

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
};

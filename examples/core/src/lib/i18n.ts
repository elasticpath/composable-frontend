import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";

export const SUPPORTED_LOCALES = ["en", "fr", "de", "es", "en-GB"];

export const LOCALE_TO_CURRENCY: Record<string, string> = {
  en: "USD",
  fr: "EUR",
  de: "EUR",
  es: "EUR",
  "en-GB": "GBP",
};

const FALLBACK_CURRENCY_CODE = "USD";

export function getCurrencyCodeForLocale(lang: string | undefined): string {
  return (lang && LOCALE_TO_CURRENCY[lang]) || FALLBACK_CURRENCY_CODE;
}

export function getPreferredCurrency(lang: string | undefined, currencies: ResponseCurrency[], cartCurrencyCode?: string) {
  if (!currencies?.length) return undefined;

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

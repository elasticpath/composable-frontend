import { getAllCurrencies } from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "./create-elastic-path-client";
import { TAGS } from "./constants";
import { LOCALE_TO_CURRENCY } from "./i18n";

export async function getCurrency(lang?: string) {
  const client = createElasticPathClient();

  const currenciesResponse = await getAllCurrencies({
    client,
    next: {
      tags: [TAGS.currencies],
    },
  });

  const currencies = currenciesResponse.data?.data || [];

  if (!currencies.length) return undefined;

  const preferredCode = lang ? LOCALE_TO_CURRENCY[lang] : undefined;

  let currency = currencies.find((c) => c.code === preferredCode && c.enabled)

  if (!currency) {
    currency = currencies.find((c) => c.default && c.enabled);
  }

  return currency;
}
"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getAllCurrencies, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { queryKeysFactory } from "src/lib/query-keys-factory";
import { useElasticPathClient } from "src/app/[lang]/(store)/ClientProvider";

const CURRENCY_QUERY_KEY = "currencies" as const;

export const currencyQueryKeys = queryKeysFactory(CURRENCY_QUERY_KEY);

export function useCurrencies(): Partial<{ data: ResponseCurrency[] }> &
  Omit<UseQueryResult<ResponseCurrency[], Error>, "data"> {
  const { client } = useElasticPathClient();

  const { data, ...rest } = useQuery({
    queryKey: currencyQueryKeys.list(),
    queryFn: async () => {
      const response = await getAllCurrencies({ client });
      return response.data?.data || [];
    },
  });

  return { data, ...rest } as const;
}

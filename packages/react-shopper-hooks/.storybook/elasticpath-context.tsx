import { QueryClient } from "@tanstack/react-query"
import React from "react"
import {
  ElasticPathProvider,
  ElasticPathProviderProps,
} from "../src/elasticpath/elasticpath"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
    },
  },
})

export default function DefaultElasticPathProvider(
  props: Omit<ElasticPathProviderProps, "queryClientProviderProps">,
) {
  return (
    <ElasticPathProvider
      {...props}
      clientId="w4QC7WVmxpwZfLaujDNMNJkgTcMmL17Lh3o9CdX3Ou"
      // host="shopper-mock.com"
      queryClientProviderProps={{ client: queryClient }}
    />
  )
}

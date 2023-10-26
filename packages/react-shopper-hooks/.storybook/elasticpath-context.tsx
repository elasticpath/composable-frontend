import { QueryClient } from "@tanstack/react-query"
import React from "react"
import { ElasticPathProvider, ElasticPathProviderProps } from "../src"

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
      clientId="123"
      host="shopper-mock.com"
      queryClientProviderProps={{ client: queryClient }}
    />
  )
}

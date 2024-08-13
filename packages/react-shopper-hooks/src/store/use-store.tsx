"use client"

import { useContext } from "react"
import { StoreProviderContext } from "../store/store-provider"
import { ElasticPath } from "@elasticpath/js-sdk"
import { NavigationNode } from "@elasticpath/shopper-common"

export function useStore(): { client: ElasticPath; nav?: NavigationNode[] } {
  const ctx = useContext(StoreProviderContext)

  if (!ctx) {
    throw new Error(
      "Store context was unexpectedly null, make sure you are using the useStore hook inside a StoreProvider!",
    )
  }

  return {
    client: ctx.client,
    nav: ctx.nav,
  }
}

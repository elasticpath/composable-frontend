import { StoreProviderProps } from "./types/store-context-types"
import React, { createContext } from "react"
import type { ElasticPath } from "@elasticpath/js-sdk"
import { NavigationNode } from "@elasticpath/shopper-common"
import { useElasticPath } from "../elasticpath"

interface StoreState {
  client: ElasticPath
  nav?: NavigationNode[]
}

export const StoreProviderContext = createContext<StoreState | null>(null)

export const StoreProvider = ({
  children,
  initialState,
}: StoreProviderProps) => {
  const { client } = useElasticPath()

  return (
    <StoreProviderContext.Provider value={{ client, nav: initialState?.nav }}>
      {children}
    </StoreProviderContext.Provider>
  )
}

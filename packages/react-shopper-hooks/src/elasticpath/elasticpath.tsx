"use client"

// import { gateway, ElasticPath as ElasticPath } from "@elasticpath/js-sdk"
import { client as defaultClient, Client } from "@epcc-sdk/sdks-shopper"
import {
  QueryClientProvider,
  QueryClientProviderProps,
} from "@tanstack/react-query"
import React, { ReactElement } from "react"
import { _eventBus$, EventContext } from "../event/event-context"

interface ElasticPathContextState {
  client: Client
}

const ElasticPathContext = React.createContext<ElasticPathContextState | null>(
  null,
)

export const useElasticPath = () => {
  const context = React.useContext(ElasticPathContext)
  if (!context) {
    throw new Error("useElasticPath must be used within a ElasticPathProvider")
  }
  return context
}

export type ElasticPathProviderPropsBase = {
  queryClientProviderProps: QueryClientProviderProps
  children: React.ReactNode
}

export type ElasticPathProviderPropsWithClient =
  ElasticPathProviderPropsBase & {
    clientId: string
    host?: string
  }

export type ElasticPathProviderPropsCustom = ElasticPathProviderPropsBase & {
  client: Client
}

export type ElasticPathProviderProps =
  | ElasticPathProviderPropsWithClient
  | ElasticPathProviderPropsCustom

export function ElasticPathProvider(
  props: ElasticPathProviderProps,
): ReactElement {
  const client: Client = "client" in props ? props.client : defaultClient

  return (
    <QueryClientProvider {...props.queryClientProviderProps}>
      <EventContext.Provider value={{ events$: _eventBus$ }}>
        <ElasticPathContext.Provider
          value={{
            client,
          }}
        >
          {props.children}
        </ElasticPathContext.Provider>
      </EventContext.Provider>
    </QueryClientProvider>
  )
}

import { gateway, Moltin as ElasticPath } from "@moltin/sdk"
import {
  QueryClientProvider,
  QueryClientProviderProps,
} from "@tanstack/react-query"
import React, { ReactElement } from "react"

interface ElasticPathContextState {
  client: ElasticPath
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

export type ElasticPathProviderProps = {
  queryClientProviderProps: QueryClientProviderProps
  children: React.ReactNode
}

export type ElasticPathProviderPropsWithClient = ElasticPathProviderProps & {
  clientId: string
  host?: string
}

export type ElasticPathProviderPropsCustom = ElasticPathProviderProps & {
  client: ElasticPath
}

export function ElasticPathProvider(
  props: ElasticPathProviderPropsWithClient,
): ReactElement
export function ElasticPathProvider(
  props: ElasticPathProviderPropsCustom,
): ReactElement
export function ElasticPathProvider(
  props: ElasticPathProviderPropsWithClient | ElasticPathProviderPropsCustom,
): ReactElement {
  const client: ElasticPath =
    "client" in props
      ? props.client
      : gateway({
          client_id: props.clientId,
          host: props.host,
        })

  return (
    <QueryClientProvider {...props.queryClientProviderProps}>
      <ElasticPathContext.Provider
        value={{
          client,
        }}
      >
        {props.children}
      </ElasticPathContext.Provider>
    </QueryClientProvider>
  )
}

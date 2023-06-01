import { StoreProviderProps } from "./types/store-context-types"
import { PGRProvider } from "@lib/payment-gateway-register/payment-gateway-provider"
import { emitter } from "@lib/event/event-context"
import { CartProvider } from "@lib/cart"
import { createContext, Dispatch, SetStateAction, useState } from "react"
import type { Moltin as EPCCClient } from "@moltin/sdk"

interface StoreState {
  client: EPCCClient
  setClient: Dispatch<SetStateAction<EPCCClient>>
}

export const StoreProviderContext = createContext<StoreState | null>(null)

// TODO give default options e.g. client and resolveCartId
export const StoreProvider = ({
  children,
  storeContext,
  resolveCartId,
  client: initialClient,
}: StoreProviderProps) => {
  const [client, setClient] = useState(initialClient)

  return (
    <StoreProviderContext.Provider value={{ client, setClient }}>
      <PGRProvider>
        <CartProvider
          cart={
            storeContext?.type === "store-context-ssr"
              ? storeContext.cart
              : undefined
          }
          emit={emitter}
          resolveCartId={resolveCartId}
          client={client}
        >
          {children}
        </CartProvider>
      </PGRProvider>
    </StoreProviderContext.Provider>
  )
}

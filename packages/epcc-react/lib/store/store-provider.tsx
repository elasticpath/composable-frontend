import { StoreProviderProps } from "./types/store-context-types"
import { PGRProvider } from "@lib/payment-gateway-register/payment-gateway-provider"
import { emitter } from "@lib/event/event-context"
import { StoreEvent } from "@lib/shared"
import { CartProvider } from "@lib/cart"

// TODO give default options e.g. client and resolveCartId
export const StoreProvider = ({
  children,
  storeContext,
  resolveCartId,
  client
}: StoreProviderProps) => {
  // TODO not emitting correctly again
  const emit2 = (val: StoreEvent) => {
    console.log("event emitted: ", val, emitter)
    emitter(val)
  }
  return (
    <PGRProvider>
      <CartProvider
        cart={
          storeContext?.type === "store-context-ssr"
            ? storeContext.cart
            : undefined
        }
        emit={emit2}
        resolveCartId={resolveCartId}
        client={client}
      >
        {children}
      </CartProvider>
    </PGRProvider>
  )
}

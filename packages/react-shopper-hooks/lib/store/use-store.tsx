import { useContext } from "react"
import { StoreProviderContext } from "@lib/store/store-provider"

export function useStore() {
  const ctx = useContext(StoreProviderContext)

  if (!ctx) {
    throw new Error(
      "Store context was unexpectedly null, make sure you are using the useStore hook inside a StoreProvider!"
    )
  }

  return {
    client: ctx.client,
  }
}

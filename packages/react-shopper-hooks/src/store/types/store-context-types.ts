import type { Cart, CartIncluded, ResourceIncluded } from "@elasticpath/js-sdk"
import { ReactNode } from "react"
import { NavigationNode } from "@elasticpath/shopper-common"

export interface StoreProviderProps {
  initialState?: InitialState
  children: ReactNode
}

export interface InitialState {
  nav?: NavigationNode[]
  cart?: ResourceIncluded<Cart, CartIncluded>
}

import {
  Cart,
  CartIncluded,
  Moltin as EPCCClient,
  ResourceIncluded
} from "@moltin/sdk"
import { ReactNode } from "react"

export interface StoreProviderProps {
  storeContext?: StoreContext
  children: ReactNode
  client: EPCCClient
  resolveCartId: () => string
}

export interface NavigationNode {
  name: string
  slug: string
  href: string
  id: string
  children: NavigationNode[]
}

interface StoreContextBase {
  nav: NavigationNode[]
}

export interface StoreContextSSR extends StoreContextBase {
  type: "store-context-ssr"
  cart?: ResourceIncluded<Cart, CartIncluded>
}

export interface StoreContextSSG extends StoreContextBase {
  type: "store-context-ssg"
}

export type StoreContext = StoreContextSSR | StoreContextSSG

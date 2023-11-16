import { NavigationNode } from "../build-site-navigation";
import { Cart, CartIncluded, ResourceIncluded } from "@moltin/sdk";

interface StoreContextBase {
  nav: NavigationNode[];
}

export interface StoreContextSSR extends StoreContextBase {
  type: "store-context-ssr";
  cart?: ResourceIncluded<Cart, CartIncluded>;
}

export interface StoreContextSSG extends StoreContextBase {
  type: "store-context-ssg";
}

export type StoreContext = StoreContextSSR | StoreContextSSG;

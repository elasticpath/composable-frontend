import {
  createBrowserVisitor,
  createShopperClient,
} from "@epcc-sdk/sdks-shopper"
import { consent } from "./visitor/consent"

const clientId = import.meta.env.VITE_APP_EPCC_CLIENT_ID!
const baseUrl = import.meta.env.VITE_APP_EPCC_ENDPOINT_URL!

if (!clientId) {
  throw new Error("Missing storefront client id")
}

if (!baseUrl) {
  throw new Error("Missing storefront endpoint URL")
}

export const { client: storefrontClient } = createShopperClient(
  { baseUrl },
  { clientId, storage: "localStorage" },
  { visitor: createBrowserVisitor({ consent }) },
)

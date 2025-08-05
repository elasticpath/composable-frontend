export * from "./client"
import { type Client, createClient } from "@hey-api/client-fetch"
export { createClient, type Client }
export { client } from "./client/sdk.gen"
export { extractProductImage, initializeCart, getCartId } from "./utils"
export * from "./interceptors"

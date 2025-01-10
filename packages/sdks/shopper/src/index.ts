export * from "./client"
export * from "./client/@tanstack/react-query.gen"
import { Client, createClient } from "@hey-api/client-fetch"
export { createClient, Client }
export { client } from "./client/sdk.gen"
export { extractProductImage } from "./utils"

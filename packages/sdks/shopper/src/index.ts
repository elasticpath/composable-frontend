export * from "./client"
import { Client, createClient } from "@hey-api/client-fetch"
export { createClient, Client }
export { client } from "./client/services.gen"
export { extractProductImage } from "./utils"

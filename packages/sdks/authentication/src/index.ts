export * from "./client"

export { createClient, createConfig } from "./client/client"
export type {
  Client,
  Config,
  RequestOptions,
  RequestResult,
} from "./client/client"

// From the generated module, not the vendored one: its type parameter defaults
// to this spec's `ClientOptions`, so `baseUrl` keeps the known base URL union.
export type { CreateClientConfig } from "./client/client.gen"

export { client } from "./client/client.gen"

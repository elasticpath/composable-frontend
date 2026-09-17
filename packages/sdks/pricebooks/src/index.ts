// Generated operations and types (src/client/index.ts is emitted by
// @hey-api/openapi-ts and re-exports sdk.gen + types.gen).
export * from "./client"

// The vendored fetch client. The generator bundles it into src/client/client
// and src/client/core, so this package has no runtime @hey-api dependency.
export { createClient, createConfig } from "./client/client"
export type {
  Client,
  Config,
  CreateClientConfig,
  RequestOptions,
  RequestResult,
} from "./client/client"

// Package-level shared client instance every operation falls back to when no
// `client` option is passed.
export { client } from "./client/client.gen"

// Zod schemas are NOT exported here so the main entry never imports zod.
// Import them from "@epcc-sdk/sdks-pricebooks/zod".

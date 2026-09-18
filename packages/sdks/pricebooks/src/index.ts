export * from "./client"

export { createClient, createConfig } from "./client/client"
export type {
  Client,
  Config,
  CreateClientConfig,
  RequestOptions,
  RequestResult,
} from "./client/client"

export { client } from "./client/client.gen"

export { createPricebooksClient } from "./runtime"
export type { PricebooksClientOptions } from "./runtime"

// Re-exported so a consumer who assembles the stack by hand installs this
// package alone. Everything here comes from "@epcc-sdk/sdks-runtime".
export {
  TokenRequestError,
  clientCredentialsProvider,
  createAuthCallback,
  createConfiguredClient,
  createRetryFetch,
  createRetryingFetch,
  createTokenSource,
  implicitProvider,
  localStorageAdapter,
  memoryStorage,
  staticTokenProvider,
} from "@epcc-sdk/sdks-runtime"
export type {
  ClientCredentialsOptions,
  GrantOptions,
  ImplicitOptions,
  RetryFetchOptions,
  RetryingFetchOptions,
  StorageAdapter,
  TokenProvider,
  TokenRequestFailure,
  TokenRequestReason,
  TokenResponse,
  TokenSource,
  TokenSourceOptions,
} from "@epcc-sdk/sdks-runtime"

// Zod schemas stay out of this entry so it never imports zod.
// Import them from "@epcc-sdk/sdks-pricebooks/zod".

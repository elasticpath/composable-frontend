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
  createAuthenticatedFetch,
  createConfiguredClient,
  createRetryFetch,
  createTokenSource,
  implicitProvider,
  localStorageAdapter,
  memoryStorage,
  staticTokenProvider,
} from "@epcc-sdk/sdks-runtime"
export type {
  AuthenticatedFetchOptions,
  ClientCredentialsOptions,
  GrantOptions,
  ImplicitOptions,
  RetryFetchOptions,
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

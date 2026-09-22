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

export { createAuthenticationRealmsClient } from "./runtime"
export type { AuthenticationRealmsClientOptions } from "./runtime"

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

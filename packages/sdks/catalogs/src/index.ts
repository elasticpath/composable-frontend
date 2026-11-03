export * from "./client"

export { createClient, createConfig } from "./client/client"
export type {
  Client,
  Config,
  RequestOptions,
  RequestResult,
} from "./client/client"

// The generated module, not the vendored one: its default type parameter keeps `baseUrl`'s union.
export type { CreateClientConfig } from "./client/client.gen"

export { client } from "./client/client.gen"

export { createCatalogsClient } from "./runtime"
export type { CatalogsClientOptions } from "./runtime"

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

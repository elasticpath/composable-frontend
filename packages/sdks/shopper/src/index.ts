export * from "./client"

export { createClient, createConfig } from "./client/client"
export type {
  Client,
  Config,
  RequestOptions,
  RequestResult,
} from "./client/client"

export type { CreateClientConfig } from "./client/client.gen"

export { client } from "./client/client.gen"

export { extractProductImage, initializeCart, getCartId } from "./utils"
export * from "./interceptors"

export { createShopperClient, configureClient } from "./auth/configure-client"
export type { AuthOptions } from "./auth/configure-client"

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

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
export type { AuthOptions, ShopperClientOptions } from "./auth/configure-client"

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

export {
  ANALYTICS_HEADER,
  ANALYTICS_OFF,
  CONSENT_NONE,
  GLOBAL_PRIVACY_CONTROL_HEADER,
  PURPOSE_ANALYTICS,
  PURPOSE_PERSONALIZATION,
  SESSION_VISITOR_COOKIE,
  VISITOR_CONSENT_HEADER,
  VISITOR_COOKIE,
  VISITOR_COOKIE_LIFETIME_SECONDS,
  VISITOR_ID_HEADER,
  hasGlobalPrivacyControl,
  readCookie,
  resolveVisitor,
  visitorHeaders,
} from "@epcc-sdk/visitor"
export type {
  ConsentFunction,
  ConsentResult,
  Purpose,
  ResolvedVisitor,
  ResolveVisitorOptions,
  Visitor,
} from "@epcc-sdk/visitor"

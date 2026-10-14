export * from "./constants"
export { readCookie } from "./cookies"
export { hasGlobalPrivacyControl } from "./global-privacy-control"
export { resolveVisitor } from "./resolve-visitor"
export { visitorHeaders } from "./visitor-headers"
export type {
  ConsentFunction,
  ConsentResult,
  Purpose,
  ResolvedVisitor,
  ResolveVisitorOptions,
  Visitor,
} from "./types"

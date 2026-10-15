# @epcc-sdk/sdks-nextjs

## 1.1.0

### Minor Changes

- 349317cf: The `/zod` export now generates Zod 4 schemas, and each schema carries its description from the spec. `z.toJSONSchema()` includes those descriptions.

  The `zod` peer dependency moves from `^3.22.0` to `^4.0.0`. Upgrade `zod` to 4 and upgrade every `@epcc-sdk` package that has a `/zod` export at the same time. The packages cannot share one install of zod while their peer ranges are on different majors. The SDK functions and types do not change.

  Zod 4 validates `format: uuid` fields strictly. A value whose version or variant digits do not follow RFC 9562 now fails to parse, although Zod 3 accepted it. Validation errors use Zod 4's issue format. For example, a missing enum value is reported as `invalid_value` where Zod 3 reported `invalid_type`.

  `@epcc-sdk/sdks-nextjs` accepts `@epcc-sdk/sdks-shopper` 0.8 as a peer dependency, as well as 0.7.

## 1.0.0

### Patch Changes

- Updated dependencies [b1c89251]
- Updated dependencies [0a4cc2cc]
  - @epcc-sdk/sdks-shopper@0.7.0

## 0.1.1

### Patch Changes

- 63110082: `isAccountAuthenticated` takes an optional cookie name, so a storefront that sets its own cookie prefix can check for its account member cookie. With no argument it still reads `_store_ep_account_member_token`.

## 0.1.0

### Minor Changes

- 201073f9: Take the client type from `@epcc-sdk/sdks-shopper` and stop depending on `@hey-api/client-fetch`.

  Breaking in practice:

  - `@epcc-sdk/sdks-shopper` is now a peer dependency at `^0.6.0`. Install it beside this package. A shopper below 0.6.0 gives a peer warning at install, because its client is a different implementation from the one these types describe.
  - `@hey-api/client-fetch` is no longer installed with this package. Code that imported it only to type the client passed to `applyDefaultNextMiddleware` should import `Client` from `@epcc-sdk/sdks-shopper` instead.

  Unchanged: `applyDefaultNextMiddleware`, `createDefaultNextMiddlewareStack`, `RequestMiddleware`, `ResponseMiddleware`, `MiddlewareStack`, the cookie interceptors, `getCookieValue`, `getAccountCookie` and `isAccountAuthenticated` keep their names and signatures.

  The published package no longer includes its test files.

## 0.0.11

### Patch Changes

- 4e4ef25: - paypal express property support
  - support overriding authorization header

## 0.0.10

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.9

### Patch Changes

- eeaa3c0: Use correct account cookie key

## 0.0.8

### Patch Changes

- 98ab640: create account middleware nextjs

## 0.0.7

### Patch Changes

- 1da007e: make the min peer dependency for nextjs sdk, next 15

## 0.0.6

### Patch Changes

- da62157: Add nextjs accounts utils

## 0.0.5

### Patch Changes

- dae717e: Export get cookie value function

## 0.0.4

### Patch Changes

- 7545ee4: support nextjs 15 interceptor

## 0.0.3

### Patch Changes

- ec5170b: add client side supporting nextjs auth interceptor

## 0.0.2

### Patch Changes

- 0496e87: init release of next gen sdks

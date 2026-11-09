# @epcc-sdk/visitor

## 0.0.2

### Patch Changes

- 65c6fcdf: Add a browser entry for storefronts with no server.

  `createBrowserVisitor` from `@epcc-sdk/visitor/browser` takes a consent function that reads your consent management platform in the browser. It fits the `visitor` option of `createShopperClient`.

  Without consent, it keeps an id in memory only. The id is sent with `EP-Visitor-Consent: none` and resets on a full page load. For a consented shopper, it writes `ep_vid` with JavaScript. On an objection, it clears `ep_vid`.

  `hasBrowserGlobalPrivacyControl` reads `navigator.globalPrivacyControl`. `@epcc-sdk/sdks-shopper` re-exports both functions, and the types `BrowserConsentFunction` and `BrowserVisitorOptions`.

  Safari limits a cookie that JavaScript writes to 7 days.

## 0.0.1

### Patch Changes

- 4794fe26: Keep a request out of analytics with `EP-Analytics: off`.

  - `@epcc-sdk/visitor` exports `ANALYTICS_OFF` (`"off"`) beside the existing `ANALYTICS_HEADER`.
  - `createShopperClient` takes an `analyticsOff` option beside `visitor`. When it is `true`, every call carries `EP-Analytics: off`, whatever the visitor state and with or without a `visitor` option. Without it, no `EP-Analytics` header is sent.
  - `createAnalyticsOffInterceptor` is exported from the package root for clients built with `createClient`.

- 4794fe26: Add `@epcc-sdk/visitor`, a zero-dependency package for the consented visitor id.

  - `resolveVisitor(request, { consent })` reads a Fetch API `Request`, calls the merchant's consent function and returns the visitor plus the `Set-Cookie` values to apply. A shopper who granted consent gets an `ep_vid` cookie with a 128-bit random id, kept for 365 days.
  - `visitorHeaders(visitor)` returns `EP-Visitor-Id` and `EP-Visitor-Consent` as a plain object.
  - Cookie, header and purpose names are exported constants.
  - A shopper who has not decided gets no visitor by default. A consent result of `{ state: "none", sessionId: true }` opts in to `ep_vsid`, a browser-session cookie, and `resolveVisitor` returns a `session` visitor that sends `EP-Visitor-Consent: none`. An objection, or no opt-in, clears `ep_vid` and `ep_vsid`. `sessionCookieName` renames the cookie. A `granted` consent result with no purpose counts as `none`.
  - `hasGlobalPrivacyControl(request)` reads `Sec-GPC: 1`, so a consent function can treat Global Privacy Control as an objection.
  - The README documents the whole contract: cookies, headers, visitor states, the consent function, the `ep_vsid` opt-in and what to declare for it, Global Privacy Control, the rules, a raw HTTP example for other languages, and Express and Fastify recipes.

---
"@epcc-sdk/visitor": patch
"@epcc-sdk/sdks-shopper": minor
---

Add a browser entry for storefronts with no server.

`createBrowserVisitor` from `@epcc-sdk/visitor/browser` takes a consent function that reads your consent management platform in the browser. It fits the `visitor` option of `createShopperClient`.

Without consent, it keeps an id in memory only. The id is sent with `EP-Visitor-Consent: none` and resets on a full page load. For a consented shopper, it writes `ep_vid` with JavaScript. On an objection, it clears `ep_vid`.

`hasBrowserGlobalPrivacyControl` reads `navigator.globalPrivacyControl`. `@epcc-sdk/sdks-shopper` re-exports both functions, and the types `BrowserConsentFunction` and `BrowserVisitorOptions`.

Safari limits a cookie that JavaScript writes to 7 days.

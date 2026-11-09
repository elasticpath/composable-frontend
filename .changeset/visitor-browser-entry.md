---
"@epcc-sdk/visitor": patch
"@epcc-sdk/sdks-shopper": minor
---

Add a browser entry for storefronts with no server. `createBrowserVisitor` from `@epcc-sdk/visitor/browser` keeps an id in memory only when the shopper has not consented (sent with `EP-Visitor-Consent: none`, reset on a full page load), writes `ep_vid` with JavaScript for a consented shopper, and clears it on an objection. It takes a consent function that reads your consent management platform in the browser, and fits the `visitor` option of `createShopperClient`. `hasBrowserGlobalPrivacyControl` reads `navigator.globalPrivacyControl`. `@epcc-sdk/sdks-shopper` re-exports both, with the types `BrowserConsentFunction` and `BrowserVisitorOptions`. Safari limits a cookie that JavaScript writes to 7 days.

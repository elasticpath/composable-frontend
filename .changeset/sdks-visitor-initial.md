---
"@epcc-sdk/visitor": minor
---

Add `@epcc-sdk/visitor`, a zero-dependency package for the consented visitor id.

- `resolveVisitor(request, { consent })` reads a Fetch API `Request`, calls the merchant's consent function and returns the visitor plus the `Set-Cookie` values to apply. A shopper who granted consent gets an `ep_vid` cookie with a 128-bit random id, kept for 365 days.
- `visitorHeaders(visitor)` returns `EP-Visitor-Id` and `EP-Visitor-Consent` as a plain object.
- Cookie, header and purpose names are exported constants.
- A shopper who has not decided gets no visitor by default. A consent result of `{ state: "none", sessionId: true }` opts in to `ep_vsid`, a browser-session cookie, and `resolveVisitor` returns a `session` visitor that sends `EP-Visitor-Consent: none`. An objection, or no opt-in, clears `ep_vid` and `ep_vsid`. `sessionCookieName` renames the cookie.
- `hasGlobalPrivacyControl(request)` reads `Sec-GPC: 1`, so a consent function can treat Global Privacy Control as an objection.

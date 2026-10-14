---
"@epcc-sdk/visitor": minor
---

Add `@epcc-sdk/visitor`, a zero-dependency package for the consented visitor id.

- `resolveVisitor(request, { consent })` reads a Fetch API `Request`, calls the merchant's consent function and returns the visitor plus the `Set-Cookie` values to apply. A shopper who granted consent gets an `ep_vid` cookie with a 128-bit random id, kept for 365 days.
- `visitorHeaders(visitor)` returns `EP-Visitor-Id` and `EP-Visitor-Consent` as a plain object.
- Cookie, header and purpose names are exported constants.

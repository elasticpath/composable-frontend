---
"@epcc-sdk/sdks-shopper": patch
---

Keep `AccessTokenResponse` as a type this package owns, derived from the generated
`CreateAnAccessTokenResponses[200]`, so the name survives a spec refresh. Drops the
now-redundant `CreateAnAccessToken` redocly override.

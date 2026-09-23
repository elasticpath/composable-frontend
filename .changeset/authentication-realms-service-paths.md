---
"@epcc-sdk/sdks-authentication-realms": minor
"@epcc-sdk/sdks-shopper": patch
---

Correct the authentication realms spec against the service. These calls could not have worked before:

- `getAllOidcProfiles`, `createOidcProfile`, `getOidcProfile`, `updateOidcProfile` and `deleteOidcProfile` now call `/oidc-profiles`. The old `/openid-connect-profiles` path returned 404.
- The five `*UserAuthenticationOIDCProfileInfo` functions now call `/user-authentication-info/{userAuthenticationInfoId}/user-authentication-oidc-profile-info`, and take the new required `userAuthenticationInfoId` path parameter. The old realm-level path returned 404.
- A realm's `type` is `authentication-realm`, and an OIDC profile's `type` is `oidc-profile`. The old values were rejected by the service and made the zod schemas reject every live response.

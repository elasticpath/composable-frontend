---
"@epcc-sdk/sdks-authentication-realms": minor
---

The `/zod` schemas parse `int64` values as `number`, the type the TypeScript types already use, instead of `bigint`. A value validated with the schema can now be passed straight to the operation or field that takes it.

- `z.coerce.bigint()` becomes `z.number().int()` behind a step that turns a string into a number, so a query string value such as `"20"` still parses, to `20`.
- The bounds the specification declares stay, as plain numbers. The 64-bit range of the format itself is no longer emitted, because a `number` cannot hold it.
- A default declared on an `int64` field is a number, not a `BigInt(…)`.
- No `BigInt(…)` is left in the generated schemas.

The TypeScript types, the SDK functions and the exported names do not change.

Breaking in practice, although the version is a minor:

- `.parse()` returns a `number` where it returned a `bigint` for `zPageLimit`, `zPageOffset`, `zGetV2AuthenticationRealmsQuery`, `zGetV2AuthenticationRealmsRealmIdOidcProfilesQuery`, `zGetV2AuthenticationRealmsRealmIdPasswordProfilesQuery`, `zGetV2AuthenticationRealmsRealmIdUserAuthenticationInfoQuery`, `zGetV2AuthenticationRealmsRealmIdUserAuthenticationInfoUserAuthInfoIdUserAuthenticationPasswordProfileInfoQuery` and `zGetV2AuthenticationRealmsRealmIdUserAuthenticationInfoUserAuthInfoIdUserAuthenticationOidcProfileInfoQuery`. Code that compared the result with a `bigint` literal such as `20n`, or did `bigint` arithmetic on it, needs to use numbers.
- Only strings are converted. A boolean is rejected, where `z.coerce.bigint()` turned `true` into `1n` and `false` into `0n`. `null` on a required field is still rejected.

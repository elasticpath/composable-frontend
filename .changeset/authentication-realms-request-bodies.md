---
"@epcc-sdk/sdks-authentication-realms": minor
"@epcc-sdk/sdks-shopper": patch
---

Match realms request bodies and resource fields to the service. Several calls were rejected by the service before this change.

- `createOneTimePasswordTokenRequest` now sends its body wrapped in `data`, as the service requires. The new `OneTimePasswordTokenRequestWrapper` type describes it.
- Update bodies are partial updates: only `type` is required, plus `id` for password profile info. `updateAuthenticationRealm` now sends the `type` the service requires.
- OIDC profile bodies and the `OIDCProfile` type use `name`, `discovery_url`, `client_id` and `client_secret`. The invented `redirect_uris` field is removed.
- OIDC profile info bodies and the `UserAuthenticationOIDCProfileInfo` type use `subject`, `issuer` and `oidc_profile_id`, not `username`.
- Password profiles gain `username_format` and `enable_one_time_password_token` and lose the invented `description` field. Realms gain `duplicate_email_policy` and `redirect_uris`.

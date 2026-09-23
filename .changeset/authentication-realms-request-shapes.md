---
"@epcc-sdk/sdks-authentication-realms": minor
---

Match the request bodies to what the service validates. The published spec sends each resource's own schema as both the create and the update body.

- Updates are partial updates that require only `type`. This covers `putV2AuthenticationRealmsRealmId`, `putV2AuthenticationRealmsRealmIdOidcProfilesProfileId`, `putV2AuthenticationRealmsRealmIdPasswordProfilesProfileId` and the OIDC profile info update, which no longer takes `oidc_profile_id`.
- Creating an OIDC profile now requires `discovery_url`, `client_id` and `client_secret`, and creating OIDC profile info requires `subject` and `issuer`. The service rejects requests without them.
- The realm update's `duplicate_email_policy` accepts `allowed` and `api_only` only, as the service does.

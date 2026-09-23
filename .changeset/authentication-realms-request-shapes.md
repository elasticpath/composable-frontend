---
"@epcc-sdk/sdks-authentication-realms": minor
---

Match the request bodies to what the service validates. The published spec sends each resource's own schema as both the create and the update body.

- Updates are partial updates that require only `type`. This covers `putV2AuthenticationRealmsRealmId`, `putV2AuthenticationRealmsRealmIdOidcProfilesProfileId`, `putV2AuthenticationRealmsRealmIdPasswordProfilesProfileId` and the OIDC profile info update, which no longer takes `oidc_profile_id`.
- Creating an OIDC profile now requires `discovery_url`, `client_id` and `client_secret`, and creating OIDC profile info requires `subject` and `issuer`. The service rejects requests without them.
- The realm update's `duplicate_email_policy` accepts `allowed` and `api_only` only, as the service does.
- The realm, OIDC profile and password profile update bodies accept an optional `id`, which must match the ID in the path. The OIDC profile info update leaves it out: the service compares it with the user authentication info ID, so sending the resource's own ID fails.

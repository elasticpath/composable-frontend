---
"@epcc-sdk/sdks-shopper": minor
---

Pick up the corrected `user-authentication-info` model from
`specs/authentication-realms.yaml`, which the shopper spec joins.

`UserAuthenticationInfo` drops `username` — a field the API neither accepts nor returns on
this resource — and gains `name`, `email`, the nullable `given_name`, `family_name` and
`middle_name`, and `meta.creation_status`. Both request wrappers follow, and the update
wrapper requires only `type`, matching the partial update the service performs. A new inline enum type, `CreationStatus`, is exported.

None of the five `user-authentication-info` operations are in the shopper filter, so only
the schema types change; no operation was added or removed. Code that read or set
`username` on one of these types no longer compiles.

---
"@epcc-sdk/sdks-authentication-realms": minor
---

Correct the `user-authentication-info` resource against the canonical Single Sign On
specification, and restore the `./zod` entry point.

The resource was modelled on its sibling `user-authentication-password-profile-info`, which
really does carry a `username`. `user-authentication-info` never has one. Every consumer of
these five operations was typed against fields the API does not return and was missing every
field it does.

- `UserAuthenticationInfo` drops `username` and gains `name` and `email`, both required, and
  the nullable `given_name`, `family_name` and `middle_name`. `meta` gains `creation_status`
  (`COMPLETE` or `IN_PROGRESS`; `IN_PROGRESS` covers a user caught mid sign-in, whose record
  the system may roll back) and is no longer required, which canonical does not guarantee.
- `UserAuthenticationInfoCreateRequestWrapper` and
  `UserAuthenticationInfoUpdateRequestWrapper` carry the same fields in place of `username`.
  The update body requires only `type`. It is a partial update — the service applies just the
  fields present — so `name` and `email` are optional there, and `id` is gone: it is already
  in the path and the service never reads it from the body.
- `GetAllUserAuthenticationInfoData["query"]` was `never`. It now carries `page[limit]`,
  `page[offset]`, `filter` and `sort` (`created_at`, `-created_at`, `id`, `-id`, `updated_at`,
  `-updated_at`), which the endpoint has always accepted.
- `UserAuthenticationInfoListResponse` gains `meta.page`, `meta.results` and the collection
  `links` (`current`, `first`, `last`, `next`, `prev`) in place of a single `self`.

Code that read or set `username` on one of these types no longer compiles. It was never
reaching the API: the field was neither sent nor returned.

The zod plugin is enabled again, so `@epcc-sdk/sdks-authentication-realms/zod` resolves.
0.1.0 declared no `./zod` subpath at all. `zod` 3.x stays an optional peer — the package root
does not import it.

No exported symbol was removed or renamed.

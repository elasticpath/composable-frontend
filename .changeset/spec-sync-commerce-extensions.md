---
"@epcc-sdk/commerce-extensions": minor
---

Regenerate from the upstream `commerce-extensions` spec (spec version 26.1015.8330282, published 2026-10-15T21:16:34Z).

**Breaking.** No export is removed, but the types get stricter: every create and update body is now required, `CustomApiRelationships.parent_apis` and its `data` are required, `JsonSchemaValidation.version` and `schema` are required, and `UpdateACustomEntryResponses` no longer lists a `201` response. Code that typed one of those objects partially stops compiling. The `If-Match` header is now optional.

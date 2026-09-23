---
"@epcc-sdk/sdks-authentication-realms": patch
---

Fix TypeScript resolution of `@epcc-sdk/sdks-authentication-realms/zod` under `moduleResolution: "node"` by adding a `typesVersions` map, and declare `zod@^3.22.0` as an optional peer dependency.

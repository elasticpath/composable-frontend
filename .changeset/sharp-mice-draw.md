---
"@epcc-sdk/sdks-shopper": patch
---

Fix React Query optional dependency issue by separating exports into `/react-query` subpath. Non-React users can now use the SDK without installing @tanstack/react-query.

---
"@epcc-sdk/sdks-subscriptions": patch
---

Breaking: Update subscriptions SDK to new API architecture

- **Breaking**: Removed Products and Plans as standalone entities - they must now be created within offerings
- **Breaking**: Removed `/subscriptions/products` and `/subscriptions/plans` endpoints
- **New**: Introduced Pricing Options for billing rules (replacing standalone Plans)
- **New**: Plans are created directly in offerings via new simplified workflow
- Simplified from 3-step process (products→plans→offerings) to 1-step (offerings with embedded plans)

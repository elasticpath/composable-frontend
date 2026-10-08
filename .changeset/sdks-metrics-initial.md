---
"@epcc-sdk/sdks-metrics": minor
---

Add `@epcc-sdk/sdks-metrics`, a generated SDK for the Elastic Path Metrics API (`/v2/metrics/orders/*` and `/v2/metrics/products/*`), built with `@hey-api/openapi-ts` 0.99.0.

- `createMetricsClient` returns a client with a caching token source, the `auth` hook, and a `fetch` that refreshes and replays once on a 401 and backs off on a 429.
- Seven operations, all `GET`: `getOrdersMetricsSummary`, `getOrdersCountTimeSeries`, `getOrdersDiscountTimeSeries`, `getOrdersValueTimeSeries`, `getProductMetricsSummary`, `getProductUnitsSoldTimeSeries` and `getProductValueTimeSeries`.
- Zod schemas for every response on `@epcc-sdk/sdks-metrics/zod`. `zod` is an optional peer dependency.
- Counts and amounts are typed as `number`, in the currency's smallest unit. Dates are strings and need millisecond precision, such as `2025-01-01T00:00:00.000Z`.
- The runtime helpers are re-exported, so installing this package alone is enough.

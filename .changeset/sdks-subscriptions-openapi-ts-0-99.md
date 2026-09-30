---
"@epcc-sdk/sdks-subscriptions": minor
---

Regenerate the subscriptions SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
`createSubscriptionsClient`, and publish the Zod schemas.

What is new:

- `createSubscriptionsClient` binds the generated `createClient` and `createConfig` to
  `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
  token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
  backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
  replay cannot duplicate work.

  ```ts
  const client = createSubscriptionsClient({
    baseUrl: "https://euwest.api.elasticpath.com",
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  })
  ```

  Credentials are resolved from `source`, `provider`, `token`, `clientId` plus
  `clientSecret`, or `clientId` alone for the implicit grant. `retry`, `storage`,
  `leewaySeconds`, `fetch` and `config` tune the rest; `config` is merged last, so
  anything the factory chose can be overridden. The runtime helpers are re-exported from
  the package root, so a consumer who assembles the stack by hand still installs only this
  package.

- Zod schemas for every request body, path and response are generated and exposed on the
  `@epcc-sdk/sdks-subscriptions/zod` subpath. `zod` is an optional peer dependency (3.x) and
  the root entry never imports it. The schemas coerce the `int64` fields listed under "What
  is fixed" to `bigint`, as the zod plugin does for every `int64`, so a parsed price amount
  or page parameter carries `bigint` where the TypeScript types say `number`.

Breaking in practice, although the version is a minor:

- The `@hey-api/client-fetch` dependency is gone. The fetch client is vendored into
  `src/client/{client,core}`, and the root entry exports `createClient`, `createConfig`,
  the shared `client` instance and the `Client`, `Config`, `CreateClientConfig`,
  `RequestOptions` and `RequestResult` types. Import those from this package instead of
  from `@hey-api/client-fetch`, which is deprecated.
- The shared `client` instance now carries a default base URL of
  `https://euwest.api.elasticpath.com`; before, it had none. The specification already
  lists EU West first; the region is set in the generator config as well, so a refresh
  that reorders the servers cannot change it.
- The seven `date-time` fields are typed `string`, not `Date`: `start` and `end` on
  `TimePeriod`, `override_first_period_end_date` on `BuildSubscription`, `valid_until` on
  `SubscriptionPriceUpdateHistoryEntry`, `due` and `sent_at` on `InvoiceNotification`, and
  `scheduled_for` on `ScheduleMeta`. The old `@hey-api/transformers` plugin declared them
  `Date`, but no operation called its transformer, so the value at runtime was always the
  string the API sends. Code that called a `Date` method on one of these fields stops
  compiling; wrap the value in `new Date(...)` where you need one.
- `_Error` is renamed to `Error`. Rename the import; the shape is unchanged.
- Request bodies drop the specification's read-only fields. `createSubscription`,
  `updateSubscription`, `createSubscriber` and `updateSubscriber` take `*Writable` bodies
  (`BuildSubscriptionWritable`, `SubscriptionUpdateWritable`, `SubscriberCreateWritable` and
  `SubscriberUpdateWritable`), and 44 `*Writable` types are new, one for each schema that
  holds a read-only field. The only field a request loses is `meta.owner` on
  `createSubscription`; a body that sets it stops compiling. The service ignores `meta` on a
  create.
- Checking `job_type` no longer narrows a `JobCreateAttributes` (the `createJob` body) to one
  job type. The old types intersected each variant with its own `job_type` literal; 0.99 writes
  the union of the variants, each of which types `job_type` as `string`, so after the check a
  field of one variant, such as `TaxRunJobAttributes`' `taxes`, is still not accessible, and a
  body can mix one job type with another's fields. Cast to the variant where you relied on the
  narrowing. `PaymentAuthority`, `FeatureConfiguration` and the other discriminated unions keep
  their narrowing: their variants declare their own literal.
- The inline enum types `Unit`, `Type`, `PaymentRetryType`, `PaymentRetryUnit`, `Action`,
  `Rounding`, `BillingIntervalType`, `EndBehavior`, `RejectionReason`, `Status2` and
  `JobType` are no longer exported, because the `exportInlineEnums` option does not exist in
  0.99. Their unions are unchanged and are now written inline at each use site. Replace a
  reference with the literal union, or derive it: `PriceUnits["unit"]`,
  `FeatureAccessAttributes["type"]`, `DunningRuleAttributes["payment_retry_type"]`,
  `NonNullable<DunningRuleAttributes["payment_retry_unit"]>`,
  `DunningRuleAttributes["action"]`, `ProrationPolicyAttributes["rounding"]`,
  `PricingOptionAttributes["billing_interval_type"]`,
  `PricingOptionAttributes["end_behavior"]`,
  `ProrationPreviewAttributes["rejection_reason"]`, `JobAttributes["status"]` and
  `JobCreateAttributes["job_type"]`.

What is fixed:

- The 59 `int64` fields are typed `number`, not `BigInt`: `amount` on `SingleCurrencyPrice`,
  `NullablePrice`, `PriceFormatting`, `SubscriptionInvoicePaymentRefundAttributes`,
  `CreateInvoicePaymentRefund` and `NotificationSchedule`; `payment_retry_interval` and
  `payment_retries_limit` on `DunningRuleAttributes` and `DunningRuleUpdateAttributes`;
  `billing_cost_before_proration`, `refunded_cost_for_unused_pricing_option_period` and
  `new_pricing_option_cost` on `ProrationPreviewAttributes`;
  `billing_cost_before_proration`, `refunded_amount_for_unused_pricing_option` and
  `new_pricing_option_cost` on `ProrationEvent`; `pro_rata_remaining_value` on
  `SubscriptionInvoiceMeta`; `PageOffset` and `PageLimit`; and the `page[offset]` and
  `page[limit]` query parameters of the 20 operations that take them. The old
  `transformers.gen.ts` declared them `BigInt`, but no operation called it, so the values
  at runtime were always numbers and the declared types were wrong. A request body that
  followed the old type threw when sent, because the old client passed it straight to
  `JSON.stringify`, which cannot serialise a `bigint`. A caller that passed a `bigint` such
  as `10n` must pass a `number`.
- A job's `attributes` are typed. The old `JobResponseAttributes` intersected `job_type`
  with the literal `"JobResponseAttributes"`, which made it `never`, so the `data` of
  `listJobs`, `createJob` and `getJob` had no usable attributes. They now carry the job's
  type, status and timestamps.

All 86 operations keep their names and their `Data` / `Response` / `Error` types.
`ClientOptions`, the known base URL union, is new; apart from the changes listed above,
nothing in the exported type surface is renamed or removed.

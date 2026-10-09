# @epcc-sdk/sdks-subscriptions

## 0.3.0

### Minor Changes

- b1c89251: The `/zod` schemas parse `int64` values as `number`, the type the TypeScript types already use, instead of `bigint`. A value validated with the schema can now be passed straight to the operation or field that takes it.

  - `z.coerce.bigint()` becomes `z.number().int()` behind a step that turns a string into a number, so a query string value such as `"20"` still parses, to `20`.
  - The bounds the specification declares stay, as plain numbers. The 64-bit range of the format itself is no longer emitted, because a `number` cannot hold it.
  - No `BigInt(…)` is left in the generated schemas.

  The TypeScript types, the SDK functions and the exported names do not change.

  Breaking in practice, although the version is a minor:

  - `.parse()` returns a `number` where it returned a `bigint` for `zSingleCurrencyPrice`, `zNullablePrice`, `zPriceFormatting`, `zDunningRuleAttributes`, `zDunningRuleUpdateAttributes`, `zProrationPreviewAttributes`, `zSubscriptionInvoicePaymentRefundAttributes`, `zCreateInvoicePaymentRefund`, `zProrationEvent`, `zSubscriptionMeta`, `zSubscriptionInvoiceMeta`, `zNotificationSchedule`, `zSubscriptionMetaWritable`, `zSubscriptionInvoiceMetaWritable`, `zPageOffset`, `zPageLimit`, `zListOfferingsQuery`, `zListOfferingPricingOptionsQuery`, `zListOfferingFeaturesQuery`, `zListOfferingPlansQuery`, `zListSubscriptionsQuery`, `zListSubscriptionFeaturesQuery`, `zListJobsQuery`, `zListImportJobsQuery`, `zGetImportQuery`, `zGetImportErrorsQuery`, `zListSubscriptionInvoicesQuery`, `zListSubscriptionInvoicePaymentsQuery`, `zListInvoicesQuery`, `zListInvoicePaymentsQuery`, `zListInvoicePaymentRefundsQuery`, `zListSchedulesQuery`, `zListSubscribersQuery`, `zListDunningRulesQuery`, `zListProrationPoliciesQuery` and `zListFeaturesQuery`, and for the schemas built from them. Code that compared the result with a `bigint` literal such as `20n`, or did `bigint` arithmetic on it, needs to use numbers.
  - Responses are affected too: `.parse()` of a response now returns `number` for price `amount` values, dunning rule retry intervals and limits, and proration and refund amounts.
  - Only strings are converted. A boolean is rejected, where `z.coerce.bigint()` turned `true` into `1n` and `false` into `0n`. `null` on a required field is still rejected.
  - `z.input` of the affected schemas is now `unknown`, because `z.preprocess` in Zod v3 types its input that way.

### Patch Changes

- 0a4cc2cc: Regenerate from the upstream `subscriptions` spec (spec version 26.1001.8242253, published 2026-10-01T12:24:43Z).

## 0.2.0

### Minor Changes

- da9b30ac: Regenerate the subscriptions SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2), add
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

## 0.1.0

### Minor Changes

- 9c857d1b: Regenerate from the upstream `subscriptions` spec (spec version 26.0825.8081050, published 2026-08-25T08:39:38Z).

  Adds 136 exported symbols.

## 0.0.5

### Patch Changes

- 52f74dc: Breaking: Update subscriptions SDK to new API architecture

  - **Breaking**: Removed Products and Plans as standalone entities - they must now be created within offerings
  - **Breaking**: Removed `/subscriptions/products` and `/subscriptions/plans` endpoints
  - **New**: Introduced Pricing Options for billing rules (replacing standalone Plans)
  - **New**: Plans are created directly in offerings via new simplified workflow
  - Simplified from 3-step process (products→plans→offerings) to 1-step (offerings with embedded plans)

## 0.0.4

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.3

### Patch Changes

- 1c3586d: Remove version from README

## 0.0.2

### Patch Changes

- 6324423: Add README sdks

## 0.0.1

### Patch Changes

- bd1e928: Add subscriptions gen 2 sdk

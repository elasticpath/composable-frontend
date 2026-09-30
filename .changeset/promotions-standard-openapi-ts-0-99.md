---
"@epcc-sdk/promotions-standard": minor
---

Regenerate the promotions standard SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2),
add `createPromotionsStandardClient`, and publish the Zod schemas.

The package now generates from a `promotions-standard-standalone@v1` bundle: the published
specification, unchanged in this repository, plus four corrections in
`specs/overrides/promotions_standard_service_corrections.yaml` where it disagrees with the
service. Each is listed below.

What is new:

- `createPromotionsStandardClient` binds the generated `createClient` and `createConfig` to
  `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
  token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
  backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
  replay cannot duplicate work.

  ```ts
  const client = createPromotionsStandardClient({
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
  `@epcc-sdk/promotions-standard/zod` subpath. `zod` is an optional peer dependency (3.x)
  and the root entry never imports it.

Breaking in practice, although the version is a minor:

- The `@hey-api/client-fetch` dependency is gone. The fetch client is vendored into
  `src/client/{client,core}`, and the root entry exports `createClient`, `createConfig`,
  the shared `client` instance and the `Client`, `Config`, `CreateClientConfig`,
  `RequestOptions` and `RequestResult` types. Import those from this package instead of
  from `@hey-api/client-fetch`, which is deprecated.
- The shared `client` instance now carries a default base URL of
  `https://euwest.api.elasticpath.com`; before, it had none. The specification lists US
  East first, so the region is chosen in the generator config instead; every other package
  on this generator already defaults to EU West, and a consumer installing two of them and
  configuring neither would otherwise talk to two regions with no warning and no type
  error.
- The two `date-time` fields, `meta.timestamps.created_at` and `meta.timestamps.updated_at`
  on `PromotionJob`, are typed `string`, not `Date`. They reach you through the responses of
  `getV2PromotionsByPromotionIdJobs`, `postV2PromotionsByPromotionIdJobs` and
  `postV2PromotionsByPromotionIdJobsByJobIdCancel`. The old `@hey-api/transformers` plugin
  declared them `Date`, but no operation called its transformer, so the value at runtime
  was always the string the API sends. Code that called a `Date` method on one of these
  fields stops compiling; wrap the value in `new Date(...)` where you need one.
- Request bodies drop the specification's read-only fields. `createAPromotion` takes
  `{ data: DataPromotionObjectWritable }`, which has no `id`: the service assigns it, and a
  body that sets `id` stops compiling. `DataPromotionObjectWritable` and the nine other
  `*Writable` types (`DataBasePromotionsWritable` and one per promotion type) are new.
- `updateAPromotion` takes `{ data: DataPromotionObjectWritable & { id: string } }`
  (`DataUpdatePromotionRequestWritable`), not the bare promotion. The service reads the body
  as `data` and returns 400 unless `data.id` matches `promotionID`, so the old body type
  could not describe a request the service accepts. `DataUpdatePromotionRequest` and
  `DataUpdatePromotionRequestWritable` are new.
- `postV2PromotionsByPromotionIdJobs` takes `{ data: { type, job_type, name, parameters } }`
  (`PromotionJobRequest`, over the new `DataPromotionJobRequest`), not the bare job. The
  service reads the body as `data` and returns 422 without it, so the old body type could not
  describe a request the service accepts.
- Checking `promotion_type` no longer narrows a `DataPromotionObject` to one promotion type.
  The old types intersected each variant with its own `promotion_type` literal; 0.99 writes
  the union of the variants, each of which declares every promotion type, so after the
  check `schema` is still the union of every variant's schema. Cast to the variant, for
  example `DataXForYDiscountPromotion`, where you relied on the narrowing.
- The inline enum types `PromotionType`, `JobType` and `ConsumeUnit` are no longer
  exported, because the `exportInlineEnums` option does not exist in 0.99. Their unions are
  unchanged and are now written inline at each use site. Replace a reference with the
  literal union, or derive it: `DataBasePromotions["promotion_type"]`,
  `NonNullable<PostV2PromotionsByPromotionIdJobsData["body"]["data"]["job_type"]>` and
  `NonNullable<NonNullable<PostV2PromotionsByPromotionIdJobsData["body"]["data"]["parameters"]>["consume_unit"]>`.

What is fixed:

- `min_cart_value` is typed `Array<DataPromotionsSchemaCurrenciesAmountAndCurrency>`, an
  array of `{ amount: number; currency: string }`, on every promotion type. The
  specification declares a free-form object, while the service reads and writes the array
  its description gives. The old type was `{ [key: string]: unknown }`; code that read it as
  an object keyed by currency must look the currency up in the array instead. Without the
  correction the field would have gone altogether: 0.99 drops a free-form object property
  from a schema that also has a read-only property.
- The `Authorization` header parameter is optional. The specification declares it required
  on every operation, on top of its bearer security scheme, so the old types made every call
  pass `headers: { Authorization }`. Leave it out: a client from
  `createPromotionsStandardClient` sends a header it is given as it is, with no token of its
  own and no replay after a 401.

All 14 operations keep their names — `getAllPromotions`, `createAPromotion`,
`deleteAPromotion`, `getAPromotion`, `updateAPromotion`, `getAPromotionHistory`,
`deleteMultiplePromotionCodes`, `getPromotionCodes`, `createPromotionCodes`,
`deleteAPromotionCode`, `getV2PromotionsByPromotionIdJobs`,
`postV2PromotionsByPromotionIdJobs`, `postV2PromotionsByPromotionIdJobsByJobIdCancel` and
`getV2PromotionsByPromotionIdJobsByJobIdFile` — and their `Data` / `Response` / `Error`
types. The four jobs operations take their names from their paths, because the
specification gives them no `operationId`. `ClientOptions`, the known base URL union, is new;
apart from the changes listed above, nothing in the exported type surface is renamed or
removed. The old types declared no `BigInt`.

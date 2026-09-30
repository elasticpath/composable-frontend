# @epcc-sdk/commerce-extensions

## 0.1.0

### Minor Changes

- ef38be4a: Regenerate the commerce extensions SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2)
  from the published specification, add `createCommerceExtensionsClient`, and publish the Zod
  schemas.

  Until now this package was generated from a hand-kept specification that had fallen behind the
  published one and the service. It is now generated from the published specification, plus the
  five extensions-endpoint operations the published one leaves out and three corrections where it
  disagrees with the service. Every operation was called against a live store, and every response
  with a body parsed with the package's own schema.

  What is new:

  - `createCommerceExtensionsClient` binds the generated `createClient` and `createConfig` to
    `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
    token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
    backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
    replay cannot duplicate work.

    ```ts
    const client = createCommerceExtensionsClient({
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
    `@epcc-sdk/commerce-extensions/zod` subpath. `zod` is an optional peer dependency (3.x) and
    the root entry never imports it. `zPageOffset`, `zPageLimit` and the query schemas of the four
    list operations coerce `page[offset]` and `page[limit]`, which the specification declares
    `int64`, to `bigint`, as the zod plugin does for every `int64`; the TypeScript types keep
    them `number`.
  - `createACustomApi` and `updateACustomApi` accept `relationships`, so a Custom API's parent
    APIs can be set. The old specification marked `relationships` read-only, and the service has
    always accepted it.
  - Custom APIs gain `presentation` (`page`, `section`), and `any` and `list` fields gain
    `validation.<type>.json_schema` (`JsonSchemaValidation`).
  - The five extensions-endpoint operations (`getCustomEntriesSettings`,
    `createACustomEntrySettings`, `getACustomEntrySettings`, `putACustomEntrySettings` and
    `deleteACustomEntrySettings`) are fully typed. The old specification built them from YAML
    merge keys that the old generator did not follow, so their query parameters, request bodies,
    `If-Match` header and responses were missing: `createACustomEntrySettings` and
    `putACustomEntrySettings` typed their body as `never`, and every response was `unknown`.

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
  - Four operations are renamed to the published specification's names:

    | Before                | After                   |
    | --------------------- | ----------------------- |
    | `getAllCustomApis`    | `listCustomApis`        |
    | `getAllCustomFields`  | `listCustomFields`      |
    | `getAllCustomEntries` | `listCustomApiEntries`  |
    | `createACustomEntry`  | `createACustomApiEntry` |

    Their `Data`, `Errors`, `Error`, `Responses` and `Response` types move with them, for
    example `GetAllCustomApisResponse` becomes `ListCustomApisResponse`.

  - Path parameter keys are hyphenated, as the service names them: `custom_api_id` becomes
    `"custom-api-id"`, `custom_field_id` becomes `"custom-field-id"`, `custom_api_entry_id`
    becomes `"custom-api-entry-id"`, and `custom_api_slug` becomes `"custom-api-slug"`. On the
    extensions endpoint the entry key is `"custom-api-entry-identifier"`: the entry's id, or the
    value of the field marked `use_as_url_slug` when there is one.
  - The schema types take the published names. `CustomApiAttributes` becomes `CustomApi`,
    `CustomFieldAttributes` becomes `CustomField` (and `BaseCustomFieldAttributes` and the six
    `<Type>CustomFieldAttributes` become `BaseCustomField` and `<Type>CustomField`),
    `CustomApiEntryAttributes` becomes `CustomApiEntry`, `ErrorResponse` becomes `Errors`,
    `Relationships` becomes `CustomApiRelationships`, `CustomEntryId` becomes `CustomApiEntryId`,
    and `CustomApiId` becomes `CustomApiid`. `_Error`, `ParentApis`, `Data`, `DataItem`,
    `SelfLink`, `SelfLinkCustomApi` and `SelfLinkCustomApiEntry` are gone; their shapes are written
    inline (`Errors["errors"][number]`, `CustomApi["links"]`, `CustomApiRelationships`).
  - `Sort` is replaced by one named type per list: `CustomApiSort`, `CustomFieldSort` and
    `CustomApiEntrySort`. The inline enum types `FieldType`, `Unique`, `AllowedType`,
    `TotalMethod`, `Type` and `PageTotalMethod2` are gone, because the `exportInlineEnums` option
    does not exist in 0.99; derive them, for example `BaseCustomField["field_type"]` or
    `NonNullable<ListCustomApiEntriesData["query"]>["page[total_method]"]`.
  - `IfMatch` and `CustomApiEntryIdentifier` are new parameter types.
  - Request bodies have their own types: `CreateCustomApi`, `UpdateCustomApi`,
    `CreateCustomField` (over `BaseCreateCustomField` and the six `<Type>CreateCustomField`),
    `UpdateCustomField` (over `BaseUpdateCustomField` and the six `<Type>UpdateCustomField`),
    `CreateCustomApiEntry` and `UpdateCustomApiEntry`.
    - Creating a Custom API or a Custom Field requires `description`, and field create also
      requires `type`, `name`, `slug` and `field_type`; the service returns 400 without them.
    - Updating a field no longer takes `field_type`, which cannot change, and requires `type`.
    - An entry body is `{ type: string; [field: string]: unknown }`, with `type` required.
  - Response fields the old specification marked required, such as `id`, `meta.timestamps`
    and the pagination `meta` and `links`, are optional, as the published specification
    declares them. The service still sends them.

  What is fixed:

  - `PageOffset`, `PageLimit` and the `page[offset]` and `page[limit]` query parameters are
    typed `number`, not `BigInt`. The `@hey-api/transformers` plugin declared `BigInt` for
    these `int64` fields while nothing converted the values, so the declared type was wrong. A
    caller that passed a `bigint` such as `10n` must pass a `number`.
  - `If-Match` is optional on entry updates and deletes. Where you send it, the value must be
    `W/"<etag_id>"`; a bare `etag_id` returns 412.

  The other 17 operations keep their names: `createACustomApi`, `deleteACustomApi`,
  `getACustomApi`, `updateACustomApi`, `getOpenApiSpecification`, `createACustomField`,
  `deleteACustomField`, `getACustomField`, `updateACustomField`, `deleteACustomEntry`,
  `getACustomEntry`, `updateACustomEntry` and the five extensions-endpoint operations above.
  This specification declares no `date-time` fields, so dropping the `@hey-api/transformers`
  plugin changes no timestamp type here.

## 0.0.3

### Patch Changes

- 36fca51b: add support for any field in custom api

## 0.0.2

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.1

### Patch Changes

- e5fbcf1: Release missing sdks

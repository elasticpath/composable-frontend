# @epcc-sdk/sdks-authentication-realms

## 0.3.0

### Minor Changes

- 58b870b6: Match the request bodies to what the service validates. The published spec sends each resource's own schema as both the create and the update body.

  - Updates are partial updates that require only `type`. This covers `putV2AuthenticationRealmsRealmId`, `putV2AuthenticationRealmsRealmIdOidcProfilesProfileId`, `putV2AuthenticationRealmsRealmIdPasswordProfilesProfileId` and the OIDC profile info update, which no longer takes `oidc_profile_id`.
  - Creating an OIDC profile now requires `discovery_url`, `client_id` and `client_secret`, and creating OIDC profile info requires `subject` and `issuer`. The service rejects requests without them.
  - The realm update's `duplicate_email_policy` accepts `allowed` and `api_only` only, as the service does.
  - The realm, OIDC profile and password profile update bodies accept an optional `id`, which must match the ID in the path. The OIDC profile info update leaves it out: the service compares it with the user authentication info ID, so sending the resource's own ID fails.

- 69223068: Regenerate from the upstream `authentication-realms` spec (spec version 1.0.6697305, published 2025-10-12T12:20:22Z).

  Adds 234 exported symbols.

  **Breaking.** Removes 184 exported symbols:

  - `authentication-realms: AuthenticationRealmListResponse`
  - `authentication-realms: AuthenticationRealmUpdateRequest`
  - `authentication-realms: OidcProfileListResponse`
  - `authentication-realms: OidcProfileCreateRequestWrapper`
  - `authentication-realms: OidcProfileUpdateRequestWrapper`
  - `authentication-realms: PasswordProfileListResponse`
  - `authentication-realms: PasswordProfileCreateRequestWrapper`
  - `authentication-realms: PasswordProfileUpdateRequestWrapper`
  - `authentication-realms: OneTimePasswordTokenRequest`
  - `authentication-realms: UserAuthenticationInfoListResponse`
  - `authentication-realms: UserAuthenticationInfoCreateRequestWrapper`
  - `authentication-realms: UserAuthenticationInfoUpdateRequestWrapper`
  - `authentication-realms: UserAuthenticationOidcProfileInfoListResponse`
  - `authentication-realms: UserAuthenticationOidcProfileInfoCreateRequestWrapper`
  - `authentication-realms: UserAuthenticationOidcProfileInfoUpdateRequestWrapper`
  - `authentication-realms: PasswordProfileInfo`
  - `authentication-realms: PasswordProfileInfoResponse`
  - `authentication-realms: PasswordProfileInfoListResponse`
  - `authentication-realms: PasswordProfileInfoCreateRequestWrapper`
  - `authentication-realms: PasswordProfileInfoCreateRequest`
  - `authentication-realms: PasswordProfileInfoUpdateRequestWrapper`
  - `authentication-realms: PasswordProfileInfoUpdateRequest`
  - `authentication-realms: GetAllAuthenticationRealmsData`
  - `authentication-realms: GetAllAuthenticationRealmsResponses`
  - `authentication-realms: GetAllAuthenticationRealmsResponse`
  - `authentication-realms: GetAuthenticationRealmData`
  - `authentication-realms: GetAuthenticationRealmErrors`
  - `authentication-realms: GetAuthenticationRealmResponses`
  - `authentication-realms: GetAuthenticationRealmResponse`
  - `authentication-realms: UpdateAuthenticationRealmData`
  - `authentication-realms: UpdateAuthenticationRealmErrors`
  - `authentication-realms: UpdateAuthenticationRealmResponses`
  - `authentication-realms: UpdateAuthenticationRealmResponse`
  - `authentication-realms: GetAllOidcProfilesData`
  - `authentication-realms: GetAllOidcProfilesResponses`
  - `authentication-realms: GetAllOidcProfilesResponse`
  - `authentication-realms: CreateOidcProfileData`
  - `authentication-realms: CreateOidcProfileResponses`
  - `authentication-realms: CreateOidcProfileResponse`
  - `authentication-realms: DeleteOidcProfileData`
  - `authentication-realms: DeleteOidcProfileErrors`
  - `authentication-realms: DeleteOidcProfileResponses`
  - `authentication-realms: DeleteOidcProfileResponse`
  - `authentication-realms: GetOidcProfileData`
  - `authentication-realms: GetOidcProfileErrors`
  - `authentication-realms: GetOidcProfileResponses`
  - `authentication-realms: GetOidcProfileResponse`
  - `authentication-realms: UpdateOidcProfileData`
  - `authentication-realms: UpdateOidcProfileErrors`
  - `authentication-realms: UpdateOidcProfileResponses`
  - `authentication-realms: UpdateOidcProfileResponse`
  - `authentication-realms: GetAllPasswordProfilesData`
  - `authentication-realms: GetAllPasswordProfilesResponses`
  - `authentication-realms: GetAllPasswordProfilesResponse`
  - `authentication-realms: CreatePasswordProfileData`
  - `authentication-realms: CreatePasswordProfileResponses`
  - `authentication-realms: CreatePasswordProfileResponse`
  - `authentication-realms: DeletePasswordProfileData`
  - `authentication-realms: DeletePasswordProfileErrors`
  - `authentication-realms: DeletePasswordProfileResponses`
  - `authentication-realms: DeletePasswordProfileResponse`
  - `authentication-realms: GetPasswordProfileData`
  - `authentication-realms: GetPasswordProfileErrors`
  - `authentication-realms: GetPasswordProfileResponses`
  - `authentication-realms: GetPasswordProfileResponse`
  - `authentication-realms: UpdatePasswordProfileData`
  - `authentication-realms: UpdatePasswordProfileErrors`
  - `authentication-realms: UpdatePasswordProfileResponses`
  - `authentication-realms: UpdatePasswordProfileResponse`
  - `authentication-realms: CreateOneTimePasswordTokenRequestData`
  - `authentication-realms: CreateOneTimePasswordTokenRequestResponses`
  - `authentication-realms: GetAllUserAuthenticationInfoData`
  - `authentication-realms: GetAllUserAuthenticationInfoResponses`
  - `authentication-realms: GetAllUserAuthenticationInfoResponse`
  - `authentication-realms: CreateUserAuthenticationInfoData`
  - `authentication-realms: CreateUserAuthenticationInfoResponses`
  - `authentication-realms: CreateUserAuthenticationInfoResponse`
  - `authentication-realms: DeleteUserAuthenticationInfoData`
  - `authentication-realms: DeleteUserAuthenticationInfoErrors`
  - `authentication-realms: DeleteUserAuthenticationInfoResponses`
  - `authentication-realms: DeleteUserAuthenticationInfoResponse`
  - `authentication-realms: GetUserAuthenticationInfoData`
  - `authentication-realms: GetUserAuthenticationInfoErrors`
  - `authentication-realms: GetUserAuthenticationInfoResponses`
  - `authentication-realms: GetUserAuthenticationInfoResponse`
  - `authentication-realms: UpdateUserAuthenticationInfoData`
  - `authentication-realms: UpdateUserAuthenticationInfoErrors`
  - `authentication-realms: UpdateUserAuthenticationInfoResponses`
  - `authentication-realms: UpdateUserAuthenticationInfoResponse`
  - `authentication-realms: GetAllUserAuthenticationOidcProfileInfoData`
  - `authentication-realms: GetAllUserAuthenticationOidcProfileInfoResponses`
  - `authentication-realms: GetAllUserAuthenticationOidcProfileInfoResponse`
  - `authentication-realms: CreateUserAuthenticationOidcProfileInfoData`
  - `authentication-realms: CreateUserAuthenticationOidcProfileInfoResponses`
  - `authentication-realms: CreateUserAuthenticationOidcProfileInfoResponse`
  - `authentication-realms: DeleteUserAuthenticationOidcProfileInfoData`
  - `authentication-realms: DeleteUserAuthenticationOidcProfileInfoErrors`
  - `authentication-realms: DeleteUserAuthenticationOidcProfileInfoResponses`
  - `authentication-realms: DeleteUserAuthenticationOidcProfileInfoResponse`
  - `authentication-realms: GetUserAuthenticationOidcProfileInfoData`
  - `authentication-realms: GetUserAuthenticationOidcProfileInfoErrors`
  - `authentication-realms: GetUserAuthenticationOidcProfileInfoResponses`
  - `authentication-realms: GetUserAuthenticationOidcProfileInfoResponse`
  - `authentication-realms: UpdateUserAuthenticationOidcProfileInfoData`
  - `authentication-realms: UpdateUserAuthenticationOidcProfileInfoErrors`
  - `authentication-realms: UpdateUserAuthenticationOidcProfileInfoResponses`
  - `authentication-realms: UpdateUserAuthenticationOidcProfileInfoResponse`
  - `authentication-realms: ListPasswordProfileInfosData`
  - `authentication-realms: ListPasswordProfileInfosResponses`
  - `authentication-realms: ListPasswordProfileInfosResponse`
  - `authentication-realms: CreatePasswordProfileInfoData`
  - `authentication-realms: CreatePasswordProfileInfoResponses`
  - `authentication-realms: CreatePasswordProfileInfoResponse`
  - `authentication-realms: DeletePasswordProfileInfoData`
  - `authentication-realms: DeletePasswordProfileInfoErrors`
  - `authentication-realms: DeletePasswordProfileInfoResponses`
  - `authentication-realms: DeletePasswordProfileInfoResponse`
  - `authentication-realms: GetPasswordProfileInfoData`
  - `authentication-realms: GetPasswordProfileInfoErrors`
  - `authentication-realms: GetPasswordProfileInfoResponses`
  - `authentication-realms: GetPasswordProfileInfoResponse`
  - `authentication-realms: UpdatePasswordProfileInfoData`
  - `authentication-realms: UpdatePasswordProfileInfoErrors`
  - `authentication-realms: UpdatePasswordProfileInfoResponses`
  - `authentication-realms: UpdatePasswordProfileInfoResponse`
  - `authentication-realms: getAllAuthenticationRealms`
  - `authentication-realms: getAuthenticationRealm`
  - `authentication-realms: updateAuthenticationRealm`
  - `authentication-realms: getAllOidcProfiles`
  - `authentication-realms: createOidcProfile`
  - `authentication-realms: deleteOidcProfile`
  - `authentication-realms: getOidcProfile`
  - `authentication-realms: updateOidcProfile`
  - `authentication-realms: getAllPasswordProfiles`
  - `authentication-realms: createPasswordProfile`
  - `authentication-realms: deletePasswordProfile`
  - `authentication-realms: getPasswordProfile`
  - `authentication-realms: updatePasswordProfile`
  - `authentication-realms: createOneTimePasswordTokenRequest`
  - `authentication-realms: getAllUserAuthenticationInfo`
  - `authentication-realms: createUserAuthenticationInfo`
  - `authentication-realms: deleteUserAuthenticationInfo`
  - `authentication-realms: getUserAuthenticationInfo`
  - `authentication-realms: updateUserAuthenticationInfo`
  - `authentication-realms: getAllUserAuthenticationOidcProfileInfo`
  - `authentication-realms: createUserAuthenticationOidcProfileInfo`
  - `authentication-realms: deleteUserAuthenticationOidcProfileInfo`
  - `authentication-realms: getUserAuthenticationOidcProfileInfo`
  - `authentication-realms: updateUserAuthenticationOidcProfileInfo`
  - `authentication-realms: listPasswordProfileInfos`
  - `authentication-realms: createPasswordProfileInfo`
  - `authentication-realms: deletePasswordProfileInfo`
  - `authentication-realms: getPasswordProfileInfo`
  - `authentication-realms: updatePasswordProfileInfo`
  - `shopper: AuthenticationRealmListResponse`
  - `shopper: AuthenticationRealmUpdateRequest`
  - `shopper: OidcProfileListResponse`
  - `shopper: OidcProfileCreateRequestWrapper`
  - `shopper: OidcProfileUpdateRequestWrapper`
  - `shopper: PasswordProfileListResponse`
  - `shopper: PasswordProfileCreateRequestWrapper`
  - `shopper: PasswordProfileUpdateRequestWrapper`
  - `shopper: OneTimePasswordTokenRequest`
  - `shopper: UserAuthenticationInfoListResponse`
  - `shopper: UserAuthenticationInfoCreateRequestWrapper`
  - `shopper: UserAuthenticationInfoUpdateRequestWrapper`
  - `shopper: UserAuthenticationOidcProfileInfoListResponse`
  - `shopper: UserAuthenticationOidcProfileInfoCreateRequestWrapper`
  - `shopper: UserAuthenticationOidcProfileInfoUpdateRequestWrapper`
  - `shopper: PasswordProfileInfo`
  - `shopper: PasswordProfileInfoResponse`
  - `shopper: PasswordProfileInfoListResponse`
  - `shopper: PasswordProfileInfoCreateRequestWrapper`
  - `shopper: PasswordProfileInfoCreateRequest`
  - `shopper: PasswordProfileInfoUpdateRequestWrapper`
  - `shopper: PasswordProfileInfoUpdateRequest`
  - `shopper: CreateOneTimePasswordTokenRequestData`
  - `shopper: CreateOneTimePasswordTokenRequestResponses`
  - `shopper: UpdatePasswordProfileInfoData`
  - `shopper: UpdatePasswordProfileInfoErrors`
  - `shopper: UpdatePasswordProfileInfoResponses`
  - `shopper: UpdatePasswordProfileInfoResponse`
  - `shopper: createOneTimePasswordTokenRequest`
  - `shopper: updatePasswordProfileInfo`

### Patch Changes

- 58b870b6: Fix TypeScript resolution of `@epcc-sdk/sdks-authentication-realms/zod` under `moduleResolution: "node"` by adding a `typesVersions` map, and declare `zod@^3.22.0` as an optional peer dependency.

## 0.2.0

### Minor Changes

- fe1fd88e: Correct the `user-authentication-info` resource against the canonical Single Sign On
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

## 0.1.0

### Minor Changes

- 1238fe38: Regenerate the authentication realms SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.2).

  - The fetch client is now vendored into the package (`client/`, `core/`), so
    `@hey-api/client-fetch` is no longer a runtime dependency. `createClient`,
    `createConfig`, the shared `client` instance and the `Client`, `Config`,
    `CreateClientConfig`, `RequestOptions` and `RequestResult` types are exported
    from the package root. `Client` is now a concrete type with no type
    parameters, so a consumer who wrote `Client<...>` with explicit type arguments
    must drop them. A consumer who imported `createClient` or `Client` from
    `@hey-api/client-fetch` should import them from this package instead.
  - The shared `client` instance now carries a default base URL,
    `https://euwest.api.elasticpath.com`, taken from the first entry in the
    specification's server list. It previously had none, so a request went to a
    relative URL and a same-origin proxy could pick it up. A consumer who does not
    want this default must pass `baseUrl` explicitly, through
    `createAuthenticationRealmsClient`, `createClient`, `client.setConfig` or the
    `baseUrl` option on a single operation.
  - `meta.created_at` and `meta.updated_at` on every resource are typed as
    `string` rather than `Date`. The `@hey-api/transformers` plugin is no longer
    enabled. It was never wired into the SDK, so these values were already plain
    ISO strings at runtime and the `Date` declaration was wrong. Code that called
    a `Date` method on one of these fields was failing at runtime and now fails to
    compile; parse the string yourself.
  - The generated `transformers.gen.ts` is removed. Its resource-level functions
    returned `data.attributes` followed by unreachable code, so anything that
    imported them lost `id`, `type` and `meta`.
  - Operation return types are now keyed by the generated `*Responses` and
    `*Errors` maps instead of the `*Response` unions. Both name families already
    existed and none were renamed, so the types a consumer names stay valid; the
    awaited `data` shape is unchanged.
  - A new exported type, `ClientOptions`, carries the known base URL union
    (`useast`, `euwest`, and `(string & {})`, so any string is still accepted).
  - The type aliases `Purpose` and `Type` are no longer exported. They were inline
    enums that nothing in the generated output referenced, and 0.99 has no
    `exportInlineEnums` option. The fields they described keep the same inline
    literal unions.

  The generated operations also changed how they merge your options. Previously the generated
  `url` and `security` values overrode anything you passed; now your values win. This only
  matters if you were passing `url` or `security` in a call's options and relying on them being
  ignored, which is unlikely to be deliberate.

- 1238fe38: Add `createAuthenticationRealmsClient`, a bound convenience factory over
  `@epcc-sdk/sdks-runtime`. Install one package, call one function, and get a client with a
  caching token source, the `auth` hook and a `fetch` that refreshes and replays once on a
  401 and backs off on a 429, a 408, and on a 5xx or a transport failure where a replay
  cannot duplicate work.

  ```ts
  const client = createAuthenticationRealmsClient({
    baseUrl: "https://useast.api.elasticpath.com",
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  })
  ```

  Credentials are resolved from `source`, `provider`, `token`, `clientId` plus
  `clientSecret`, or `clientId` alone for the implicit grant. `retry`, `storage`,
  `leewaySeconds`, `fetch` and `config` tune the rest; `config` is merged last, so anything
  the factory chose can be overridden.

  The runtime helpers — `createTokenSource`, `createAuthenticatedFetch`, `createRetryFetch`,
  `createConfiguredClient`, the token providers and the storage adapters — are re-exported
  from the package root, so a consumer who assembles the stack by hand still installs only
  `@epcc-sdk/sdks-authentication-realms`.

  The README's Authentication section previously said helpers were still being worked on and
  showed a request interceptor that set a static bearer token. An interceptor cannot see a
  response, so it can never retry a 401. It now leads with the factory.

  `@epcc-sdk/sdks-runtime` is a new runtime dependency. It depends on
  `@epcc-sdk/authentication`, which it uses to call the token endpoint. Installing this
  package therefore adds two packages to a dependency tree.

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

- ce0c960: Support esm modules

## 0.0.2

### Patch Changes

- cf20312: Use correct open api spec entry for one time password

## 0.0.1

### Patch Changes

- 77a4840: add authentication realms sdk

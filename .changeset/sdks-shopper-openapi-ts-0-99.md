---
"@epcc-sdk/sdks-shopper": minor
---

Regenerate the shopper SDK with `@hey-api/openapi-ts` 0.99.0 (previously 0.61.1), move its
authentication onto `@epcc-sdk/sdks-runtime`, and publish Zod schemas. The joined shopper
specification and the build steps that produce it are unchanged.

What is new:

- `createShopperClient(config, authOpts)` and `configureClient(config, authOpts)` keep their
  arguments and their `{ client, auth }` return, and now run on `@epcc-sdk/sdks-runtime`: a
  caching token source, the `auth` hook, a `fetch` that replays once with a fresh token after
  a 401, and backoff on a 429, a 408, and a 5xx or transport failure when the method is safe to
  repeat. The backoff now applies in the browser too, for example in the InstantSearch adapter
  and the SPA examples. Pass `retry: false` to keep authentication and drop the backoff, or
  retry options to change its schedule. `retry` is the only new option on `AuthOptions`.

  ```ts
  const { client } = createShopperClient(
    { baseUrl: "https://euwest.api.elasticpath.com" },
    { clientId: "your-client-id" },
  )
  ```

  Tokens stay under the `_store_ep_credentials` key in `localStorage` (or the cookie), and a
  token stored by 0.5.x is read without a new token request. `wrapUserFetch: false` still
  passes your `fetch` through untouched, and `auth` keeps `getValidAccessToken`, `refresh`,
  `clear` and `getSnapshot`. `createTokenSource`, `createAuthenticatedFetch`,
  `createRetryFetch`, `createConfiguredClient` and the other runtime helpers are re-exported
  from the package root.

- Zod schemas for every request body, path, query and response are on the
  `@epcc-sdk/sdks-shopper/zod` subpath. `zod` is an optional peer dependency (3.x) and the root
  entry never imports it. The schemas coerce `int64` fields to `bigint`, so a parsed value
  carries `bigint` where the TypeScript types say `number`.

- Request bodies leave out fields the server sets. Ten operations take a `*Writable` body
  type: `addTaxItemToCart`, `addTaxItemToCartItemComponent`,
  `updateTaxItemFromCartItemComponent`, `updateATaxItem`, `bulkAddTaxItemsToCart`,
  `updateCustomDiscountForCart`, `updateCustomDiscountForCartItem`, `putV2SettingsCart`,
  `putV2SettingsCartStoreId` and `manageCarts` (its subscription item). An object literal that
  sends a read-only field, such as `id` in a cart settings update, stops compiling. A response
  object passed back as a body still compiles. 82 `*Writable` types and schemas are added.

Breaking in practice, although the version is a minor:

- The `@hey-api/client-fetch` dependency is gone. The fetch client is vendored, and the root
  exports `createClient`, `createConfig`, `client` and the `Client`, `Config`,
  `CreateClientConfig`, `Options`, `RequestOptions`, `RequestResult` and `ClientOptions`
  types. Import them from this package instead.
- A network failure now comes back as `{ error }` with no `response`, instead of being thrown,
  as HTTP errors already did. Check `error` rather than only `data`, or pass
  `throwOnError: true` to throw.
- The shared `client` defaults to `https://euwest.api.elasticpath.com`. Catalog, OAuth,
  multi-search and `/v2` operations all resolve under that one host.
- The client's `next` request option is typed `never`. It never reached Next.js: the client
  hands `fetch` a `Request`, which drops it. Remove `next: { tags }` from operation calls.
- `client.get`, `client.post` and the other method helpers take a map of status code to
  response type: write `client.get<{ 200: MyType }>(...)`, not `client.get<MyType>(...)`.
- The 72 `date-time` fields are typed `string`, not `Date`. The old transformers were never
  called, so the value at runtime was always the string the API sends. Wrap one in
  `new Date(...)` where you need a `Date`. By resource, with the operations that carry them:

  - Account Management Authentication: `AccountManagementAuthenticationTokenResponse["expires"]`. In `postV2AccountMembersTokens`.
  - Cart Items: `CartItemCollectionResponse["included"]["promotions"]["end"]`, `CartItemCollectionResponse["included"]["promotions"]["start"]`. In `bulkUpdateItemsInCart`.
  - Cart Management: `BaseCartResponse["snapshot_date"]`; `CartIncludedPromotion["start"]`, `CartIncludedPromotion["end"]`. In `createACart`, `createCartPaymentIntent`, `getACart`, `getCarts`, `updateACart`, `updateCartPaymentIntent`.
  - Cart Shipping Groups: `DeliveryEstimate["start"]`, `DeliveryEstimate["end"]`; `ShippingGroupResponse["created_at"]`, `ShippingGroupResponse["updated_at"]`. In `createOrderShippingGroup`, `createShippingGroup`, `getOrderShippingGroups`, `getShippingGroupById`, `getShippingGroups`, `getShippingGroupsById`, `putShippingGroupById`, `updateShippingGroup`.
  - Catalogs: `Catalog["attributes"]["created_at"]`, `Catalog["attributes"]["updated_at"]`. In `createCatalog`, `getCatalogById`, `getCatalogs`, `updateCatalog`.
  - Exported but not returned by any operation: `Pricebook["attributes"]["created_at"]`, `Pricebook["attributes"]["updated_at"]`; `ProductDiff["attributes"]["diff_created_at"]`, `ProductDiff["attributes"]["updated_at"]["this"]`, `ProductDiff["attributes"]["updated_at"]["other"]`; `BuildSubscription["override_first_period_end_date"]`; `ScheduleMeta["scheduled_for"]`; `OidcProfileResponse["meta"]["created_at"]`, `OidcProfileResponse["meta"]["updated_at"]`; `UserAuthenticationInfoResponse["meta"]["created_at"]`, `UserAuthenticationInfoResponse["meta"]["updated_at"]`; `SearchRuleGroupMeta["created_at"]`, `SearchRuleGroupMeta["updated_at"]`; `SearchRuleMeta["created_at"]`, `SearchRuleMeta["updated_at"]`; `StopwordSetMeta["created_at"]`, `StopwordSetMeta["updated_at"]`, `StopwordSetMeta["last_synced_at"]`; `SynonymSetMeta["created_at"]`, `SynonymSetMeta["updated_at"]`, `SynonymSetMeta["last_synced_at"]`.
  - Orders: `CondensedPromotionResponse["start"]`, `CondensedPromotionResponse["end"]`. In `getOrderItems`.
  - Password Profiles: `OneTimePasswordTokenRequestResponse["expires_at"]`; `AuthenticationRealmsMetaTimestamps["created_at"]`, `AuthenticationRealmsMetaTimestamps["updated_at"]`. In `createOneTimePasswordTokenRequest`, `updatePasswordProfileInfo`.
  - Releases: `Release["attributes"]["published_at"]`; `ReleaseMeta["created_at"]`, `ReleaseMeta["started_at"]`, `ReleaseMeta["updated_at"]`. In `getByContextRelease`, `getReleaseById`, `getReleases`, `publishRelease`.
  - Rules: `Rule["attributes"]["created_at"]`, `Rule["attributes"]["updated_at"]`; `RuleSchedule["valid_from"]`, `RuleSchedule["valid_to"]`; `CatalogRuleValidatorRequest["data"]["schedules"]["valid_from"]`, `CatalogRuleValidatorRequest["data"]["schedules"]["valid_to"]`, `CatalogRuleValidatorRequest["data"]["match_date"]`. In `createRule`, `getRuleById`, `getRules`, `updateRule`, `validateCatalogRules`.
  - Shopper Catalog API: `AlternativePrices["sale_expires"]`; `FileReference["created_at"]`; `HierarchyAttributes["created_at"]`, `HierarchyAttributes["published_at"]`, `HierarchyAttributes["updated_at"]`; `NodeAttributes["created_at"]`, `NodeAttributes["published_at"]`, `NodeAttributes["updated_at"]`; `ProductAttributes["published_at"]`, `ProductAttributes["created_at"]`, `ProductAttributes["updated_at"]`; `ProductMeta["sale_expires"]`, `ProductMeta["component_products"]["sale_expires"]`, `ProductMeta["tiers"]["sale_expires"]`; `Schedule["valid_from"]`, `Schedule["valid_to"]`. In `configureByContextProduct`, `getAllHierarchies`, `getAllNodes`, `getAllProducts`, `getAllRelatedProducts`, `getByContextAllHierarchies`, `getByContextAllNodes`, `getByContextAllProducts`, `getByContextAllRelatedProducts`, `getByContextChildNodes`, `getByContextChildProducts`, `getByContextHierarchy`, `getByContextHierarchyChildNodes`, `getByContextHierarchyNodes`, `getByContextNode`, `getByContextProduct`, `getByContextProductsForHierarchy`, `getByContextProductsForNode`, `getChildNodes`, `getChildProducts`, `getHierarchy`, `getHierarchyChildNodes`, `getHierarchyNodes`, `getNode`, `getProduct`, `getProductsForHierarchy`, `getProductsForNode`.
  - Subscriptions: `TimePeriod["start"]`, `TimePeriod["end"]`; `SubscriptionPriceUpdateHistoryEntry["valid_until"]`; `InvoiceNotification["due"]`, `InvoiceNotification["sent_at"]`. In `getInvoice`, `getSubscription`, `getSubscriptionInvoice`, `listInvoices`, `listSubscriptionInvoices`, `listSubscriptions`.
  - Operation parameters: `body.data.delivery_estimate.start` in `createOrderShippingGroup`; `body.data.delivery_estimate.end` in `createOrderShippingGroup`.

- `_Error` is renamed to `Error`. Rename the import; the shape is unchanged.
- The inline enum types are no longer exported, because `exportInlineEnums` does not exist in
  0.99. Their unions are unchanged and written at each use site. Derive one where you need it:

  - `Owner`: `NonNullable<ReleaseMeta["owner"]>`
  - `ReleaseStatus`: `NonNullable<ReleaseMeta["release_status"]>`
  - `MatchType`: `NonNullable<CatalogRuleValidatorRequest["data"]>["match_type"]`
  - `Type`: `CustomAttributes[string]["type"]`
  - `PromotionSource`: `NonNullable<CartItemResponse["promotion_source"]>`
  - `Gateway`: `DataBasePayments["gateway"]`
  - `Method`: `DataBasePayments["method"]`
  - `Payment`: `NonNullable<OrderResponse["payment"]>`
  - `Shipping`: `NonNullable<OrderResponse["shipping"]>`
  - `TransactionType`: `NonNullable<TransactionResponse["transaction_type"]>`
  - `CaptureMechanism`: `NonNullable<TransactionResponse["capture_mechanism"]>`
  - `RefundMechanism`: `NonNullable<TransactionResponse["refund_mechanism"]>`
  - `Unit`: `PriceUnits["unit"]`
  - `PaymentRetryType`: `DunningRuleAttributes["payment_retry_type"]`
  - `PaymentRetryUnit`: `NonNullable<DunningRuleAttributes["payment_retry_unit"]>`
  - `Action`: `DunningRuleAttributes["action"]`
  - `Rounding`: `ProrationPolicyAttributes["rounding"]`
  - `BillingIntervalType`: `PricingOptionAttributes["billing_interval_type"]`
  - `EndBehavior`: `PricingOptionAttributes["end_behavior"]`
  - `RejectionReason`: `ProrationPreviewAttributes["rejection_reason"]`
  - `JobType`: `JobCreateAttributes["job_type"]`
  - `TotalMethod`: `NonNullable<PaginationResults["total_method"]>`
  - `AccountMemberSelfManagement`: `NonNullable<AccountAuthenticationSettings["account_member_self_management"]>`
  - `DuplicateEmailPolicy`: `NonNullable<AuthenticationRealm["duplicate_email_policy"]>`
  - `UsernameFormat`: `NonNullable<PasswordProfile["username_format"]>`
  - `Purpose`: `OneTimePasswordTokenRequestInput["purpose"]`
  - `CreationStatus`: `NonNullable<NonNullable<UserAuthenticationInfoResponse["meta"]>["creation_status"]>`
  - `Placement`: `MoveSearchRuleRequest["data"]["attributes"]["placement"]`
  - `Match`: `NonNullable<SearchRuleTrigger["match"]>`
  - `SyncStatus`: `StopwordSetMeta["sync_status"]`
  - `SplitJoinTokens`: `NonNullable<NonNullable<TypoTolerance>["split_join_tokens"]>`
  - `PageTotalMethod`: `NonNullable<NonNullable<GetV2AccountAddressesData["query"]>["page[total_method]"]>`
  - `Sort`: `NonNullable<NonNullable<GetV2AccountsData["query"]>["sort"]>`

- `Status` now names the subscription status (`"active" | "inactive"`, previously `Status2`).
  The catalog search indexing status it used to name (`"succeeded" | "failed"`) is no longer
  exported.
- Fields widened by OpenAPI 3.1 type arrays: `ResponseErrorItem["status"]` is
  `string | number` (was `number`), and `CustomAttributes[string]["value"]` is
  `string | boolean | number` (was `number`). Narrow before numeric use, for example
  `Number(error.status)`.
- `authentication_mechanism` is required on each variant of `postV2AccountMembersTokens`'
  body. It was already required by the API.
- Six response fields the specification marks read-only gain `readonly`:
  `CartItemResponse`'s `type`, `unit_price`, `value`, `promotion_source` and
  `custom_attributes`, and `OrderItemResponse["custom_attributes"]`.
- `/react-query` no longer has query options or query keys for POST operations, only their
  mutations: 62 names are removed, the `*Options` and `*QueryKey` of `addCustomDiscountToCartItem`, `addTaxItemToCart`, `addTaxItemToCartItemComponent`, `anonymizeOrders`, `bulkAddCustomDiscountsToCart`, `bulkAddTaxItemsToCart`, `cancelATransaction`, `captureATransaction`, `checkoutApi`, `configureByContextProduct`, `confirmOrder`, `confirmPayment`, `createACart`, `createAccountCartAssociation`, `createAnAccessToken`, `createCartPaymentIntent`, `createCatalog`, `createCustomerCartAssociation`, `createOneTimePasswordTokenRequest`, `createOrderShippingGroup`, `createRule`, `createShippingGroup`, `createSubscriptionState`, `manageCarts`, `paymentSetup`, `postV2AccountAddress`, `postV2AccountMembersTokens`, `postV2Accounts`, `publishRelease`, `refundATransaction`, `validateCatalogRules`. `postMultiSearch`,
  a search sent as a POST, keeps both. Every other name, `getACartQueryKey` included, is
  unchanged.
- A custom `tokenProvider` that returns no `access_token` now fails the request with an error,
  instead of storing an empty token.

What is fixed:

- The 114 `int64` fields, and the 8 `int64` page-size aliases (`PageLimit`, `PageOffset`,
  `Limit`, `Offset`, `SubscriptionsPageLimit`, `SubscriptionsPageOffset`,
  `AuthenticationRealmspageLimit` and `AuthenticationRealmspageOffset`), are typed `number`,
  not `BigInt`. The old transformers were never called, so the values at runtime were always
  numbers, and a request body typed `BigInt` could not be serialised. A caller that passed
  `BigInt(10)` or `10n` must pass `10`. By resource:

  - Inventory: `StockResponseAttributes["available"]`, `StockResponseAttributes["allocated"]`, `StockResponseAttributes["total"]`; `StockLocations["available"]`, `StockLocations["allocated"]`, `StockLocations["total"]`. In `getStock`.
  - Exported but not returned by any operation: `ReleaseIndexingCompleteData["data"]["duration_ms"]`; `NullablePrice["amount"]`; `DunningRuleAttributes["payment_retry_interval"]`, `DunningRuleAttributes["payment_retries_limit"]`; `DunningRuleUpdateAttributes["payment_retry_interval"]`, `DunningRuleUpdateAttributes["payment_retries_limit"]`; `ProrationPreviewAttributes["billing_cost_before_proration"]`, `ProrationPreviewAttributes["refunded_cost_for_unused_pricing_option_period"]`, `ProrationPreviewAttributes["new_pricing_option_cost"]`; `SubscriptionInvoicePaymentRefundAttributes["amount"]`; `CreateInvoicePaymentRefund["attributes"]["amount"]`; `TransactionResponseAttributes["quantity"]`; `NullableLocation["available"]`; `StockCreateAttributes["available"]`, `StockCreateAttributes["locations"]["available"]`; `TransactionCreateAttributes["quantity"]`.
  - Offerings: `NotificationSchedule["amount"]`. In `getOffering`, `getSubscription`, `listOfferingPricingOptions`, `listOfferings`, `listSubscriptionPricingOptions`, `listSubscriptions`.
  - Releases: `ReleaseMeta["total_products"]`, `ReleaseMeta["total_nodes"]`, `ReleaseMeta["indexing_duration_ms"]`. In `getByContextRelease`, `getReleaseById`, `getReleases`, `publishRelease`.
  - Search: `TextMatchInfo["num_tokens_dropped"]`. In `postMultiSearch`.
  - Shopper Catalog API: `Amount["amount"]`; `PageMeta["results"]["total"]`, `PageMeta["page"]["limit"]`, `PageMeta["page"]["offset"]`, `PageMeta["page"]["current"]`, `PageMeta["page"]["total"]`; `BundleConfiguration["selected_options"]`; `TieredAmount["amount"]`, `TieredAmount["tiers"]["amount"]`. In `configureByContextProduct`, `getAllHierarchies`, `getAllNodes`, `getAllProducts`, `getAllRelatedProducts`, `getByContextAllHierarchies`, `getByContextAllNodes`, `getByContextAllProducts`, `getByContextAllRelatedProducts`, `getByContextChildNodes`, `getByContextChildProducts`, `getByContextComponentProductIds`, `getByContextHierarchyChildNodes`, `getByContextHierarchyNodes`, `getByContextProduct`, `getByContextProductsForHierarchy`, `getByContextProductsForNode`, `getCatalogs`, `getChildNodes`, `getChildProducts`, `getComponentProductIds`, `getHierarchyChildNodes`, `getHierarchyNodes`, `getProduct`, `getProductsForHierarchy`, `getProductsForNode`, `getRules`, `validateCatalogRules`.
  - Subscriptions: `SingleCurrencyPrice["amount"]`; `PriceFormatting["amount"]`; `SubscriptionInvoiceMeta["pro_rata_remaining_value"]`; `ProrationEvent["billing_cost_before_proration"]`, `ProrationEvent["refunded_amount_for_unused_pricing_option"]`, `ProrationEvent["new_pricing_option_cost"]`. In `getInvoice`, `getOffering`, `getSubscription`, `getSubscriptionInvoice`, `getSubscriptionInvoicePayment`, `listInvoices`, `listOfferingPlans`, `listOfferingPricingOptions`, `listOfferings`, `listSubscriptionInvoicePayments`, `listSubscriptionInvoices`, `listSubscriptionPlans`, `listSubscriptionPricingOptions`, `listSubscriptions`.
  - Operation parameters: `page[limit]` in `getAllHierarchies`, `getAllNodes`, `getAllProducts`, `getAllRelatedProducts`, `getByContextAllHierarchies`, `getByContextAllNodes`, `getByContextAllProducts`, `getByContextAllRelatedProducts`, `getByContextChildNodes`, `getByContextChildProducts`, `getByContextComponentProductIds`, `getByContextHierarchyChildNodes`, `getByContextHierarchyNodes`, `getByContextProductsForHierarchy`, `getByContextProductsForNode`, `getCatalogs`, `getChildNodes`, `getChildProducts`, `getComponentProductIds`, `getHierarchyChildNodes`, `getHierarchyNodes`, `getProductsForHierarchy`, `getProductsForNode`, `getRules`, `getV2AccountMembers`, `getV2Accounts`, `getV2AccountsAccountIdAccountMemberships`, `listInvoices`, `listOfferingFeatures`, `listOfferingPlans`, `listOfferingPricingOptions`, `listOfferings`, `listSubscriptionInvoicePayments`, `listSubscriptionInvoices`, `listSubscriptions`, `validateCatalogRules`; `page[offset]` in `getAllHierarchies`, `getAllNodes`, `getAllProducts`, `getAllRelatedProducts`, `getByContextAllHierarchies`, `getByContextAllNodes`, `getByContextAllProducts`, `getByContextAllRelatedProducts`, `getByContextChildNodes`, `getByContextChildProducts`, `getByContextComponentProductIds`, `getByContextHierarchyChildNodes`, `getByContextHierarchyNodes`, `getByContextProductsForHierarchy`, `getByContextProductsForNode`, `getCatalogs`, `getChildNodes`, `getChildProducts`, `getComponentProductIds`, `getHierarchyChildNodes`, `getHierarchyNodes`, `getProductsForHierarchy`, `getProductsForNode`, `getRules`, `getV2AccountMembers`, `getV2Accounts`, `getV2AccountsAccountIdAccountMemberships`, `listInvoices`, `listOfferingFeatures`, `listOfferingPlans`, `listOfferingPricingOptions`, `listOfferings`, `listSubscriptionInvoicePayments`, `listSubscriptionInvoices`, `listSubscriptions`, `validateCatalogRules`.

- `JobResponseAttributes` no longer carries a stray `job_type: "JobResponseAttributes"`; the
  job's real `job_type` comes from `JobCreateAttributes`.
- The `/react-query` declarations import the `dataTagSymbol` and `dataTagErrorSymbol` they use
  as keys. With `skipLibCheck` off they no longer fail to compile, and with it on, a cache read
  such as `getQueryData(getACartOptions(...).queryKey)` is typed as the cart again, not `{}`.

All 149 operations keep their names and their `Data`, `Response` and `Error` types. Apart
from the changes listed above, no exported type is renamed or removed and no property is
dropped.

# @epcc-sdk/sdks-cart-checkout-order

## 0.3.0

### Minor Changes

- 29081728: Turn the generator's read/write split back on. Request bodies now leave out fields the server
  sets, and no property is lost from any type or Zod schema.

  The split was off in 0.2.0 because it dropped properties such as the `data` of the tax item,
  shipping group and transaction responses. The generator config now normalises the input in
  memory before generation, the same way `@epcc-sdk/sdks-shopper` does. No specification file
  changes:

  - keywords other than `description`, `readOnly` and `writeOnly` beside a `$ref` are removed;
  - a bare `type: object` is treated as free-form (`additionalProperties: true`);
  - an enum `default` that is not one of the enum's values is dropped.

  What changes:

  - Eight operations take a `*Writable` body type, and their `/zod` body schemas switch the same
    way, so parsing a body strips the read-only fields:
    - `addTaxItemToCart`, `addTaxItemToCartItemComponent`, `updateTaxItemFromCartItemComponent`
      and `updateATaxItem` take `CartItemTaxesEntityResponseWritable`, without the tax item `id`;
    - `bulkAddTaxItemsToCart` takes `CartsBulkTaxesWritable`, without each tax item's `id`;
    - `putV2SettingsCart` and `putV2SettingsCartStoreId` take `SettingsCartWritable`, without the
      settings `id`;
    - `manageCarts` takes `SubscriptionItemObjectWritable` for its subscription item, without the
      read-only cart item fields it carried from `CartItemResponse` (`product_id`, `slug`,
      `unit_price`, `value`, `meta`, `links`, `relationships` and the others the server sets).
      The other item shapes are unchanged.
  - An object literal that sends one of those fields, such as a tax item `id`, stops compiling.
    A response object passed back as a body still compiles.
  - 28 `*Writable` types and 28 `z*Writable` schemas are added.
  - No `readonly` markers are added. The types carry the same 51 as 0.2.0, one for each read-only
    field in the specification.

  Every other type and schema keeps every property it had in 0.2.0, and no property changes
  between optional and required.

  The declarations ship as one bundled file per entry, `dist/index.d.ts` and `dist/zod.d.ts`
  (and their `.d.cts` versions), instead of one file per source module, so two builds give
  identical output. Imports from `@epcc-sdk/sdks-cart-checkout-order` and its `/zod` subpath are
  unchanged. A deep import of a per-module declaration under `dist/` no longer resolves.

### Patch Changes

- d15ce589: `/zod` keeps the fields of valid cart and checkout payloads instead of stripping them.

  - `zCheckoutApiBody` keeps `data.account` and `data.contact` on an account checkout. A customer checkout now requires `data.customer` and an account checkout `data.contact`, as the service does, so `CustomerCheckout.data.customer` and `AccountCheckout.data.contact` are required in the TypeScript types too.
  - `zManageCartsResponse`, `zCartsResponse` and `zCartItemsResponse` keep every field of custom, subscription and promotion items, which they stripped to `{}`. Their items are now `CartItemObject`, or the new `CustomItemCartObject`, `SubscriptionItemCartObject` and `PromotionItemCartObject`, each a `CartItemResponse` with a fixed `type` and a required `quantity`, in place of the request wrappers `CustomItemObject`, `SubscriptionItemObject` and `PromotionItemObject`.
  - `CartsResponse.meta.display_price` keeps `shipping` and `shipping_discount`.
  - `zCheckoutApiResponse` accepts an order item with an empty `product_id`, which the service returns for a custom item.

## 0.2.0

### Minor Changes

- c8863c14: Regenerate the carts, checkout and orders SDK with `@hey-api/openapi-ts` 0.99.0 (previously
  0.61.2), add `createCartCheckoutOrderClient`, and publish the Zod schemas.

  The package still generates from its `cart-checkout-standalone@v1` bundle: the published
  specification, unchanged in this repository, plus the cart item union it already carried and
  three new corrections in `specs/overrides/cart_checkout_service_corrections.yaml`, where the
  specification disagrees with the service. They are listed under "What is fixed".

  What is new:

  - `createCartCheckoutOrderClient` binds the generated `createClient` and `createConfig` to
    `@epcc-sdk/sdks-runtime`, so one install and one call give you a client with a caching
    token source, the `auth` hook and a `fetch` that refreshes and replays once on a 401 and
    backs off on a 429 or a 408, and on a 500, 502, 503, 504 or a transport failure where a
    replay cannot duplicate work.

    ```ts
    const client = createCartCheckoutOrderClient({
      baseUrl: "https://euwest.api.elasticpath.com",
      clientId: process.env.EPCC_CLIENT_ID!,
      clientSecret: process.env.EPCC_CLIENT_SECRET!,
    })
    ```

    Credentials are resolved from `source`, `provider`, `token`, `clientId` plus
    `clientSecret`, or `clientId` alone for the implicit grant. `retry`, `storage`,
    `leewaySeconds`, `fetch` and `config` tune the rest; `config` is merged last, so anything
    the factory chose can be overridden. The runtime helpers are re-exported from the package
    root, so a consumer who assembles the stack by hand still installs only this package.

  - Zod schemas for every request body, path, header, query and response are generated and
    exposed on the `@epcc-sdk/sdks-cart-checkout-order/zod` subpath. `zod` is an optional peer
    dependency (3.x) and the root entry never imports it.

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
  - The eleven `date-time` fields are typed `string`, not `Date`:

    - `snapshot_date` on `BaseCartResponse`, and so on `CartResponse`;
    - `start` and `end` on `CondensedPromotionResponse`, and on the promotions in
      `CartItemCollectionResponse.included`;
    - `start` and `end` on `DeliveryEstimate`;
    - `created_at` and `updated_at` on `ShippingGroupResponse`;
    - `start` and `end` in the `delivery_estimate` of the `createOrderShippingGroup` body.

    They reach you through 19 operations: `getCarts`, `createACart`, `getACart`, `updateACart`,
    `bulkUpdateItemsInCart`, `createCartPaymentIntent`, `updateCartPaymentIntent`,
    `checkoutApi`, `getAnOrder`, `updateAnOrder`, `getOrderItems`, `getShippingGroups`,
    `createShippingGroup`, `getShippingGroupById`, `updateShippingGroup`,
    `getOrderShippingGroups`, `createOrderShippingGroup`, `getShippingGroupsById` and
    `putShippingGroupById`. The old `@hey-api/transformers` plugin declared them `Date`, but no
    operation called its transformer, so the value at runtime was always the string the API
    sends. Code that called a `Date` method on one of these fields stops compiling; wrap the
    value in `new Date(...)` where you need one.

  - Four request bodies send a `delivery_estimate`: `createShippingGroup`,
    `updateShippingGroup`, `putShippingGroupById` and `createOrderShippingGroup`. A JavaScript
    `Date` passed there used to compile, and `JSON.stringify` sent it as an ISO string. It
    stops compiling now; pass the string yourself, for example `start: date.toISOString()`.
  - More properties are `readonly`: six declarations that the specification marks `readOnly`
    beside a `$ref` or an `enum`, which the old generator did not see. They make `unit_price`,
    `value` and `promotion_source` on `CartItemObject` (and so on the `manageCarts` body); `type`,
    `unit_price`, `value`, `promotion_source` and `custom_attributes` on `CartItemResponse`;
    `custom_attributes` on `OrderItemResponse`; and `unit_price`, `value`, `promotion_source` and
    `custom_attributes` on `SubscriptionItemObject["data"]` read-only. An object literal that sets them
    still compiles; code that assigns to one of them on an existing object stops compiling.
  - The inline enum types `Type`, `PromotionSource`, `Gateway`, `Method`, `Status`, `Payment`,
    `Shipping`, `TransactionType`, `CaptureMechanism` and `RefundMechanism` are no longer
    exported, because the `exportInlineEnums` option does not exist in 0.99. Their unions are
    unchanged and are now written inline at each use site. Replace a reference with the
    literal union, or derive it: `CustomAttributes[string]["type"]`,
    `NonNullable<CartItemResponse["promotion_source"]>`, `DataBasePayments["gateway"]`,
    `NonNullable<DataBasePayments["method"]>`, `NonNullable<OrderResponse["status"]>`,
    `NonNullable<OrderResponse["payment"]>`, `NonNullable<OrderResponse["shipping"]>`,
    `NonNullable<TransactionResponse["transaction_type"]>`,
    `NonNullable<TransactionResponse["capture_mechanism"]>` and
    `NonNullable<TransactionResponse["refund_mechanism"]>`.
  - Two fields follow the specification's OpenAPI 3.1 type arrays, where the old generator kept
    one type:
    - An error's `status` in `ResponseErrorItem`, and in the inline errors of
      `UpdateACartError`, is `string | number`, not `number`. That changes the `Error` type of
      44 operations, and the `errors` array that the cart, order and bulk tax responses carry.
      Code that assigns it straight to a `number` must narrow it first.
    - The `value` of a custom attribute in `CustomAttributes` is `string | boolean | number`,
      not `number`, so a string or boolean attribute value now compiles, as the specification's
      own examples send. Code that reads it as a `number` must narrow it first.

  Unchanged on purpose: the read/write split is off. This package's generator config sets
  `parser.transforms.readWrite` to `false`, the one place it differs from the other packages on
  0.99. With the split on, the generator drops a property it treats as free-form from any schema
  that has a read-only property, and in this specification that includes properties written as
  `type: object` beside a `$ref`: `data` would go from 39 types and `links` from 28, and
  responses such as `CartItemTaxesEntityResponse` would become untyped records. With it off,
  every property the old types carried is still there, in the types and in `/zod`, no
  `*Writable` types are generated, and request bodies keep their 0.61 shape, read-only fields
  included.

  What is fixed:

  - A bulk tax item in `CartsBulkTaxes` takes an optional `meta: { component_product_id }`,
    the uuid of a component product in the bundle the cart item holds. The service reads it
    to put the tax item on that component instead of on the cart item, and the specification's
    own description and `bulkBundleComponentTaxItems` example send it, but its schema left
    `meta` out: the example did not compile against `bulkAddTaxItemsToCart`'s body, and
    `zBulkAddTaxItemsToCartBody` would have stripped it. `CartsBulkTaxes` is also the response
    type of `bulkAddTaxItemsToCart`, so `meta` appears there as optional too; the service does
    not return it.
  - `updateCustomDiscountForCart` and `updateCustomDiscountForCartItem` take `amount` as a
    negative integer in the currency's smallest unit, the only form the service accepts. The
    specification pointed both request bodies at the response shape, so `amount` was typed as
    an `{ amount, currency, formatted }` object, which the service rejects with a 400. The
    bodies are now `CartsCustomDiscountsEntityRequest` over the new
    `CartsCustomDiscountsUpdateObject`, with every field optional except `type`. A caller who
    sent the object form must send the number instead, for example `amount: -150`.
    `CartsCustomDiscountsResponseObject` is still exported, unchanged.
  - `addCustomDiscountToCartItem` takes its discount wrapped in `{ data: ... }`, as the
    service requires. The specification declared the bare `CartsCustomDiscountsObject` as the
    body, and the service answers that with a 422 ("The data field is required"). The body is
    now the new `CartsCustomDiscountsCreateRequest`, `{ data: CartsCustomDiscountsObject }`. A
    caller who sent the bare object must wrap it in `data`.

  All 60 operations keep their names — `getCarts`, `createACart`, `deleteACart`, `getACart`,
  `updateACart`, `deleteAllCartItems`, `getCartItems`, `manageCarts`, `bulkUpdateItemsInCart`,
  `deleteACartItem`, `updateACartItem`, `deleteAccountCartAssociation`,
  `createAccountCartAssociation`, `deleteCustomerCartAssociation`,
  `createCustomerCartAssociation`, `deleteAPromotionViaPromotionCode`, `addTaxItemToCart`,
  `addTaxItemToCartItemComponent`, `deleteTaxItemFromCartItemComponent`,
  `updateTaxItemFromCartItemComponent`, `bulkDeleteTaxItemsFromCart`, `bulkAddTaxItemsToCart`,
  `deleteATaxItem`, `updateATaxItem`, `bulkDeleteCustomDiscountsFromCart`,
  `bulkAddCustomDiscountsToCart`, `deleteCustomDiscountFromCart`,
  `updateCustomDiscountForCart`, `addCustomDiscountToCartItem`,
  `deleteCustomDiscountFromCartItem`, `updateCustomDiscountForCartItem`, `getShippingGroups`,
  `createShippingGroup`, `deleteCartShippingGroup`, `getShippingGroupById`,
  `updateShippingGroup`, `createCartPaymentIntent`, `updateCartPaymentIntent`, `checkoutApi`,
  `getCustomerOrders`, `getAnOrder`, `updateAnOrder`, `getOrderItems`, `anonymizeOrders`,
  `confirmOrder`, `paymentSetup`, `confirmPayment`, `captureATransaction`,
  `refundATransaction`, `getOrderTransactions`, `getATransaction`, `cancelATransaction`,
  `getOrderShippingGroups`, `createOrderShippingGroup`, `getShippingGroupsById`,
  `putShippingGroupById`, `getV2SettingsCart`, `putV2SettingsCart`,
  `getV2SettingsCartStoreId` and `putV2SettingsCartStoreId` — and their `Data` / `Response` /
  `Error` types. `ClientOptions`, the known base URL union, `CartsCustomDiscountsUpdateObject` and `CartsCustomDiscountsCreateRequest` are new; apart from the changes
  listed above, nothing in the exported type surface is renamed or removed. The old types
  declared no `BigInt`.

## 0.1.0

### Minor Changes

- e755d2ce: Refresh the carts and accounts OpenAPI specs against the canonical specs in `elasticpath-dev`.

  **`@epcc-sdk/sdks-accounts`** — adds the nine missing operations: five on `/v2/account-tags`
  (`listAccountTags`, `createAnAccountTag`, `getAnAccountTag`, `updateAnAccountTag`,
  `deleteAnAccountTag`), three on `/v2/accounts/{accountID}/relationships/account-tags`
  (`getAnAccountTagsRelationship`, `addAccountTagsOnAccount`, `removeAccountTagsOnAccount`),
  plus `putV2AccountMembersAccountMemberId`.

  Note for callers: the canonical spec marks fields as `required` on five authentication request
  bodies that previously had none — `PasswordRequest`, `PasswordlessRequest`, `SelfSignupRequest`,
  `OpenIDConnectRequest` and `SwitchingAccountRequest`. Code that already sends a complete request
  is unaffected; code that relied on these being fully optional will now need the documented
  fields.

  **`@epcc-sdk/sdks-cart-checkout-order`** — adds the three component-product tax operations
  (`addTaxItemToCartItemComponent`, `updateTaxItemFromCartItemComponent`,
  `deleteTaxItemFromCartItemComponent`) and four cart settings operations (`getV2SettingsCart`,
  `putV2SettingsCart`, `getV2SettingsCartStoreId`, `putV2SettingsCartStoreId`).

  **`@epcc-sdk/sdks-shopper`** — gains the same seven cart operations. The shopper accounts
  surface is unchanged.

  **No exported type or function is removed from any of the three packages.** The canonical carts
  spec remodels a cart item as one flat `CartItemResponse` with a `type` discriminator, replacing
  the four-way union our SDKs expose. That model is deliberately kept: `CartsResponse`,
  `CartItemsResponse`, `CartItemObject` and `Data.StripeConnectPayment` are preserved, and
  `manageCarts`, `deleteACartItem`, `updateACartItem` and `getCartItems` still return the union
  wrappers. The divergence is now written down in `packages/sdks/specs/patches/README.md` so the
  next refresh does not silently drop it.

  The `commerce-extensions` spec is deliberately left untouched: its checked-in copy is a strict
  superset of the canonical spec, so refreshing it would remove operations and rename exports for
  no gain.

## 0.0.8

### Patch Changes

- b7736679: add support for external_ref in shipping groups

## 0.0.7

### Patch Changes

- 60f1e9c: Updated cart sdk to match latest spec

## 0.0.6

### Patch Changes

- b383b5c: Converted SDK packages to use tsup for dual ESM and CommonJS output formats. These changes allow for better compatibility with both ESM and CommonJS environments.

  Key changes:

  - Added tsup build configuration for all SDK packages
  - Updated package.json files to use proper ESM and CommonJS paths
  - Added `type: "module"` to specify ESM as the default format
  - Configured package exports to support both import and require
  - Fixed type exports using `export type` to support isolation mode
  - Added test files for both ESM and CommonJS consumption

## 0.0.5

### Patch Changes

- 09d3a57: add missing cart properties

## 0.0.4

### Patch Changes

- 1a19c39: Add include to get an order operation
- a4adea2: add customer details to order response

## 0.0.3

### Patch Changes

- 1e94fe3: add include for cart checkout get orders

## 0.0.2

### Patch Changes

- d3d3c11: Update to match latest specs

## 0.0.1

### Patch Changes

- 0733828: add cart, checkout, order sdks

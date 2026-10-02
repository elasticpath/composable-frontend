---
"@epcc-sdk/sdks-cart-checkout-order": minor
---

Regenerate the carts, checkout and orders SDK with `@hey-api/openapi-ts` 0.99.0 (previously
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

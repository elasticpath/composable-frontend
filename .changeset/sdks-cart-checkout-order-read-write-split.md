---
"@epcc-sdk/sdks-cart-checkout-order": minor
---

Turn the generator's read/write split back on. Request bodies now leave out fields the server
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
- 26 `*Writable` types and 26 `z*Writable` schemas are added.
- No `readonly` markers are added. The types carry the same 51 as 0.2.0, one for each read-only
  field in the specification.

Every other type and schema keeps every property it had in 0.2.0, and no property changes
between optional and required.

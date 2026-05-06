---
"@epcc-sdk/sdks-shopper": minor
---

Regenerate from updated `catalog_view` spec. Adds pricebook segmentation, catalog rule validation and indexing completion types.

- New endpoint `validateCatalogRules` (`POST /catalogs/rules/validate`) with `match_type` of `filter`, `similarity`, `conflict`, or `resolve_for_shopper`.
- New product fields `available_prices`, `alternative_prices`, `available_pricebook_ids` on shopper-context product responses; component product metadata also gains `alternative_prices`.
- New `EP-Pricebook-IDs-Of-Available-Prices-To-Show` request header (comma-delimited pricebook IDs or `'all'`) on release/product endpoints.
- `getRules` filter now supports `pricebook_ids` (`eq()` and `in()`).
- New types: `AvailablePrices`, `AlternativePrices`, `RuleMeta`, `CatalogRuleValidatorRequest`, `ReleaseIndexingCompleteData`.

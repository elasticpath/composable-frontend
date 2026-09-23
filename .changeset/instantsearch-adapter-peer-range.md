---
"@elasticpath/catalog-search-instantsearch-adapter": patch
---

Widen the `@epcc-sdk/sdks-shopper` peer range from an exact pin to `>=0.3.0 <1.0.0`.

The published 3.0.0 declares `"@epcc-sdk/sdks-shopper": "0.3.0"`, because `workspace:*` is
replaced with the exact current version at publish. Every shopper release therefore left this
package's peer range stale, and a stale peer range on a `minor` dependency release is what
changesets treats as a major bump. 1.0.0, 2.0.0 and 3.0.0 were each published that way, and
each changelog entry for them reads "### Patch Changes — Updated dependencies".

The adapter does not track shopper's minor versions; it uses the catalog search operations,
which have been stable across all of them. The upper bound is real: shopper is pre-1.0, so a
1.0.0 would be a genuine break and correctly falls outside this range.

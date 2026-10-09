---
"@epcc-sdk/sdks-pxm": minor
---

The `/zod` schemas parse `int64` values as `number`, the type the TypeScript types already use, instead of `bigint`. A page offset or limit validated with the schema can now be passed straight to the operation that takes it.

- `z.coerce.bigint()` becomes `z.coerce.number().int()`, so a query string value such as `"20"` still parses, to `20`.
- The bounds the specification declares stay, as plain numbers: `zPageOffset` and `zPageLimit` still accept 0 to 10000 and reject `-1`, `10001`, `1.5` and `"abc"`.
- No `BigInt(…)` is left in the generated schemas.

The TypeScript types, the SDK functions and the exported names do not change.

Breaking in practice, although the version is a minor:

- `.parse()` returns a `number` where it returned a `bigint` for `zPageOffset`, `zPageLimit`, and the `page[offset]` and `page[limit]` fields of `zGetAllChildrenQuery`, `zGetAllModifiersQuery`, `zGetAllNodeChildrenQuery`, `zGetAllNodesInHierarchyQuery`, `zGetAllNodesQuery`, `zGetAllProductsQuery`, `zGetAllVariationOptionsQuery`, `zGetAllVariationsQuery`, `zGetCustomRelationshipsQuery`, `zGetHierarchyQuery`, `zGetNodeProductsQuery`, `zGetProductsNodesQuery`, `zGetRelatedProductIdsOfAProductIdQuery`, `zGetRelatedProductsOfAProductIdQuery` and `zListAttachedCustomRelationshipQuery`. Code that compared the result with a `bigint` literal such as `20n`, or did `bigint` arithmetic on it, needs to use numbers.
- `null` given to one of these fields now coerces to `0`, as `z.coerce.number()` does, where `z.coerce.bigint()` rejected it.
